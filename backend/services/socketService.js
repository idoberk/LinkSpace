const jwt = require('jsonwebtoken');
const User = require('../models/User');
const messageService = require('./messageService');
const conversationService = require('./conversationService');
const { createError } = require('../utils/errorUtils');

const connectedUsers = new Map();

const authenticateSocket = async (socket, next) => {
	try {
		const token = socket.handshake.auth.token;

		if (!token) {
			return next(createError('Authentication error', 401));
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId);

		if (!user) {
			return next(createError('User not found', 404));
		}

		socket.userId = user._id.toString();
		socket.user = user;
		next();
	} catch (error) {
		next(createError('Authentication error', 401));
	}
};

const handleUserConnection = async (socket) => {
	console.log(`User ${socket.user.profile.firstName} connected`);

	connectedUsers.set(socket.userId, socket.id);

	await User.findByIdAndUpdate(socket.userId, {
		'status.isOnline': true,
		'status.lastSeen': new Date(),
	}).exec();

	socket.join(`user_${socket.userId}`);
};

const handleUserDisconnection = async (socket) => {
	console.log(`User ${socket.user.profile.firstName} disconnected`);

	connectedUsers.delete(socket.userId);

	await User.findByIdAndUpdate(socket.userId, {
		'status.isOnline': false,
		'status.lastSeen': new Date(),
	}).exec();
};

const emitToRecipient = (io, recipientId, event, data) => {
	const recipientSocketId = connectedUsers.get(recipientId);

	if (recipientSocketId) {
		io.to(recipientSocketId).emit(event, data);
	}
};

const notifyOtherParticipants = (
	io,
	conversation,
	currentUserId,
	event,
	data,
) => {
	conversation.participants.forEach((participantId) => {
		if (participantId.toString() !== currentUserId) {
			emitToRecipient(io, participantId.toString(), event, data);
		}
	});
};

const handleSendMessage = async (socket, io, data) => {
	try {
		const {
			recipientId,
			content,
			messageType = 'text',
			media = null,
		} = data;
		const conversation = await conversationService.getOrCreateConversation(
			socket.userId,
			recipientId,
		);
		const message = await messageService.createMessage(
			conversation._id,
			socket.userId,
			content,
			messageType,
			media,
		);

		const messageData = {
			message,
			conversationId: conversation._id,
		};

		socket.emit('message_sent', messageData);
		emitToRecipient(io, recipientId, 'new_message', messageData);
	} catch (error) {
		console.error('Error sending message:', error);
		socket.emit('error', { message: error.message });
	}
};

const handleMarkAsRead = async (socket, io, data) => {
	try {
		const { conversationId } = data;
		const conversation = await messageService.markMessagesAsRead(
			conversationId,
			socket.userId,
		);

		socket.emit('messages_marked_read', { conversationId });

		notifyOtherParticipants(
			io,
			conversation,
			socket.userId,
			'messages_read_by_user',
			{
				conversationId,
				userId: socket.userId,
			},
		);
	} catch (error) {
		console.error('Error marking messages as read:', error);
		socket.emit('error', { message: error.message });
	}
};

const handleTypingIndicator = async (socket, io, data, isTyping) => {
	try {
		const { conversationId, recipientId } = data;

		const conversation = await conversationService.getOrCreateConversation(
			socket.userId,
			recipientId,
		);

		await conversationService.updateTypingStatus(
			conversationId,
			socket.userId,
			isTyping,
		);

		notifyOtherParticipants(
			io,
			conversation,
			socket.userId,
			'user_typing',
			{
				conversationId: conversation._id,
				userId: socket.userId,
				isTyping,
			},
		);
	} catch (error) {
		console.error('Error updating typing status:', error);
	}
};

const setupSocketHandlers = (io) => {
	console.log('Hello');

	io.use(authenticateSocket);

	io.on('connection', (socket) => {
		handleUserConnection(socket);

		socket.on('send_message', (data) =>
			handleSendMessage(socket, io, data),
		);
		socket.on('mark_as_read', (data) => handleMarkAsRead(socket, io, data));

		socket.on('typing_start', (data) =>
			handleTypingIndicator(socket, io, data, true),
		);
		socket.on('typing_stop', (data) =>
			handleTypingIndicator(socket, io, data, false),
		);

		socket.on('disconnect', () => handleUserDisconnection(socket));
	});
};

module.exports = setupSocketHandlers;
