const jwt = require('jsonwebtoken');
const User = require('../models/User');
const messageService = require('./messageService');
const conversationService = require('./conversationService');
const { createError } = require('../utils/errorUtils');

const connectedUsers = new Map();

/**
 * Authenticates a socket connection using JWT.
 * @param {Object} socket - The socket.io socket
 * @param {Function} next - The next middleware function
 */
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

/**
 * Handles user connection logic (status, room join, etc.).
 * @param {Object} socket - The socket.io socket
 */
const handleUserConnection = async (socket) => {
	connectedUsers.set(socket.userId, socket.id);

	await User.findByIdAndUpdate(socket.userId, {
		'status.isOnline': true,
		'status.lastSeen': new Date(),
	}).exec();

	socket.join(`user_${socket.userId}`);
};

/**
 * Handles user disconnection logic (status, cleanup, etc.).
 * @param {Object} socket - The socket.io socket
 */
const handleUserDisconnection = async (socket) => {
	connectedUsers.delete(socket.userId);

	await User.findByIdAndUpdate(socket.userId, {
		'status.isOnline': false,
		'status.lastSeen': new Date(),
	}).exec();
};

/**
 * Emits an event to a specific recipient by user ID.
 * @param {Object} io - The socket.io server instance
 * @param {string} recipientId - The recipient user ID
 * @param {string} event - The event name
 * @param {Object} data - The event data
 */
const emitToRecipient = (io, recipientId, event, data) => {
	const recipientSocketId = connectedUsers.get(recipientId);
	if (recipientSocketId) {
		io.to(recipientSocketId).emit(event, data);
	}
};

/**
 * Notifies all other participants in a conversation except the current user.
 * @param {Object} io - The socket.io server instance
 * @param {Object} conversation - The conversation document
 * @param {string} currentUserId - The current user's ID
 * @param {string} event - The event name
 * @param {Object} data - The event data
 */
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

/**
 * Handles sending a message via socket.
 * @param {Object} socket - The socket.io socket
 * @param {Object} io - The socket.io server instance
 * @param {Object} data - The message data
 */
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

		// Emit to both sender and recipient
		emitToRecipient(io, recipientId, 'new_message', messageData); // recipient
		emitToRecipient(io, socket.userId, 'new_message', messageData); // sender
	} catch (error) {
		console.error('Error sending message:', error);
		socket.emit('error', { message: error.message });
	}
};

/**
 * Handles marking messages as read via socket.
 * @param {Object} socket - The socket.io socket
 * @param {Object} io - The socket.io server instance
 * @param {Object} data - The data containing conversationId
 */
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

/**
 * Sets up all socket event handlers for the server.
 * @param {Object} io - The socket.io server instance
 */
const setupSocketHandlers = (io) => {
	io.use(authenticateSocket);
	io.on('connection', (socket) => {
		handleUserConnection(socket);

		socket.on('send_message', (data) =>
			handleSendMessage(socket, io, data),
		);
		socket.on('mark_as_read', (data) => handleMarkAsRead(socket, io, data));

		socket.on('disconnect', () => handleUserDisconnection(socket));
	});
};

module.exports = setupSocketHandlers;
