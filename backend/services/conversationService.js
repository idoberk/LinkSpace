const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { createError } = require('../utils/errorUtils');

/**
 * Filters online status for participants based on their privacy settings.
 * @param {Array<Object>} participants - Array of user documents
 */
const filterOnlineStatus = (participants) => {
	participants.forEach((participant) => {
		if (participant.settings?.privacy?.showOnlineStatus === 'private') {
			participant.status = {
				isOnline: null,
				isActive: null,
				lastSeen: null,
			};
		}
	});
};

/**
 * Gets paginated conversations for a user.
 * @param {string|ObjectId} userId - The user ID
 * @param {Object} options - Pagination and filter options
 * @returns {Promise<Object>} - Conversations and pagination info
 */
const getUserConversations = async (userId, options = {}) => {
	const { page = 1, limit = 10, includeInactive = false } = options;

	const query = { participants: userId };
	if (!includeInactive) {
		query.isActive = true;
	}

	const skip = (page - 1) * limit;

	const [conversations, total] = await Promise.all([
		Conversation.find(query)
			.populate(
				'participants',
				'profile.firstName profile.lastName profile.avatar status settings.privacy.showOnlineStatus',
			)
			.populate({
				path: 'lastMessage',
				populate: {
					path: 'sender',
					select: 'profile.firstName profile.lastName profile.avatar',
				},
			})
			.sort({ lastMessageAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean(),
		Conversation.countDocuments(query),
	]);

	conversations.forEach((conversation) => {
		filterOnlineStatus(conversation.participants);
	});

	return {
		conversations,
		pagination: {
			page,
			limit,
			total,
			pages: Math.ceil(total / limit),
			hasNext: page < Math.ceil(total / limit),
			hasPrev: page > 1,
		},
	};
};

/**
 * Gets or creates a conversation between two users (must be friends).
 * @param {string|ObjectId} user1Id - First user ID
 * @param {string|ObjectId} user2Id - Second user ID
 * @returns {Promise<Object>} - The conversation document
 */
const getOrCreateConversation = async (user1Id, user2Id) => {
	const [user1, user2] = await Promise.all([
		User.findById(user1Id),
		User.findById(user2Id),
	]);

	if (!user1 || !user2) {
		throw createError('One or both users not found', 404);
	}

	if (!user1.friends.includes(user2Id)) {
		throw createError('You can only message friends', 403);
	}

	const conversation = await Conversation.findOrCreateConversation(
		user1Id,
		user2Id,
	);

	await conversation.populate(
		'participants',
		'profile.firstName profile.lastName profile.avatar status settings.privacy.showOnlineStatus',
	);
	await conversation.populate({
		path: 'lastMessage',
		populate: {
			path: 'sender',
			select: 'profile.firstName profile.lastName profile.avatar',
		},
	});

	filterOnlineStatus(conversation.participants);

	return conversation;
};

/**
 * Updates typing status for a user in a conversation.
 * @param {string|ObjectId} conversationId - The conversation ID
 * @param {string|ObjectId} userId - The user ID
 * @param {boolean} isTyping - Typing status
 * @returns {Promise<Object>} - The updated conversation
 */
const updateTypingStatus = async (conversationId, userId, isTyping) => {
	const conversation = await Conversation.findById(conversationId);

	if (!conversation || !conversation.participants.includes(userId)) {
		throw createError('Access denied', 403);
	}

	await conversation.setTypingStatus(userId, isTyping);
	return conversation;
};

/**
 * Gets the unread message count for a user in a conversation.
 * @param {string|ObjectId} conversationId - The conversation ID
 * @param {string|ObjectId} userId - The user ID
 * @returns {Promise<number>} - The unread count
 */
const getUnreadCount = async (conversationId, userId) => {
	const conversation = await Conversation.findById(conversationId);

	if (!conversation || !conversation.participants.includes(userId)) {
		return 0;
	}

	return conversation.unreadCount.get(userId.toString()) || 0;
};

/**
 * Hard deletes all conversations for a user.
 * @param {string|ObjectId} userId - The user ID
 * @param {Object} session - Mongoose session (optional)
 * @returns {Promise<Object>} - The delete result
 */
const deleteConversationsByUser = async (userId, session = null) => {
	const filter = { participants: userId };
	const options = session ? { session } : {};
	return Conversation.deleteMany(filter, options);
};

module.exports = {
	getUserConversations,
	getOrCreateConversation,
	updateTypingStatus,
	getUnreadCount,
	deleteConversationsByUser,
};
