const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { createError } = require('../utils/errorUtils');

const updateConversationAfterMessage = async (
	conversation,
	message,
	senderId,
) => {
	conversation.lastMessage = message._id;
	conversation.lastMessageAt = new Date();

	conversation.participants.forEach((participantId) => {
		if (participantId.toString() !== senderId) {
			conversation.incrementUnreadCount(participantId);
		}
	});

	await conversation.save();
};

const markMessagesAsRead = async (conversationId, userId) => {
	const conversation = await Conversation.findById(conversationId);

	if (!conversation || !conversation.participants.includes(userId)) {
		throw createError('Access denied', 403);
	}

	const unreadMessages = await Message.find({
		conversation: conversationId,
		sender: { $ne: userId },
		isRead: false,
	});

	for (const message of unreadMessages) {
		await message.markAsRead();
	}

	/* await Message.updateMany(
		{
			conversation: conversationId,
			sender: { $ne: userId },
			isRead: false,
		},
		{
			isRead: true,
			readAt: new Date(),
		},
	); */

	await conversation.resetUnreadCount(userId);

	return conversation;
};

const createMessage = async (
	conversationId,
	senderId,
	content,
	messageType = 'text',
	media = null,
) => {
	const conversation = await Conversation.findById(conversationId);

	if (!conversation) {
		throw createError('Conversation not found', 404);
	}

	if (!conversation.participants.includes(senderId)) {
		throw createError(
			'You are not a participant in this conversation',
			403,
		);
	}

	if (messageType === 'text' && !content.trim()) {
		throw createError('Message content is required', 400);
	}

	if (messageType !== 'text' && !media) {
		throw createError('Media is required for non-text messages', 400);
	}

	const messageData = {
		sender: senderId,
		conversation: conversationId,
		content: content || '',
		messageType,
	};

	if (media) {
		messageData.media = media;
	}

	const message = new Message(messageData);

	await message.save();

	await updateConversationAfterMessage(conversation, message, senderId);

	await message.populate(
		'sender',
		'profile.firstName profile.lastName profile.avatar',
	);

	return message;
};

module.exports = {
	createMessage,
	markMessagesAsRead,
};
