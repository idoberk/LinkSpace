const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { createError } = require('../utils/errorUtils');

/**
 * Updates conversation after a message is sent (last message, unread counts).
 * @param {Object} conversation - The conversation document
 * @param {Object} message - The message document
 * @param {string|ObjectId} senderId - The sender's user ID
 * @returns {Promise<void>}
 */
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

/**
 * Marks all messages as read for a user in a conversation.
 * @param {string|ObjectId} conversationId - The conversation ID
 * @param {string|ObjectId} userId - The user ID
 * @returns {Promise<Object>} - The updated conversation
 */
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

	await conversation.resetUnreadCount(userId);

	return conversation;
};

/**
 * Creates a new message in a conversation.
 * @param {string|ObjectId} conversationId - The conversation ID
 * @param {string|ObjectId} senderId - The sender's user ID
 * @param {string} content - The message content
 * @param {string} [messageType='text'] - The message type
 * @param {Object|null} [media=null] - The media object (if any)
 * @returns {Promise<Object>} - The created message document
 */
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

/**
 * Hard deletes all messages sent by a user.
 * @param {string|ObjectId} userId - The user ID
 * @param {Object} session - Mongoose session (optional)
 * @returns {Promise<Object>} - The delete result
 */
const deleteMessagesByUser = async (userId, session = null) => {
	const filter = { sender: userId };
	const options = session ? { session } : {};
	return Message.deleteMany(filter, options);
};

module.exports = {
	createMessage,
	markMessagesAsRead,
	deleteMessagesByUser,
};
