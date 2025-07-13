const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { createError } = require('../utils/errorUtils');

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

const updateTypingStatus = async (conversationId, userId, isTyping) => {
	const conversation = await Conversation.findById(conversationId);

	if (!conversation || !conversation.participants.includes(userId)) {
		throw createError('Access denied', 403);
	}

	await conversation.setTypingStatus(userId, isTyping);
	return conversation;
};

const getUnreadCount = async (conversationId, userId) => {
	const conversation = await Conversation.findById(conversationId);

	if (!conversation || !conversation.participants.includes(userId)) {
		return 0;
	}

	return conversation.unreadCount.get(userId.toString()) || 0;
};

module.exports = {
	getUserConversations,
	getOrCreateConversation,
	updateTypingStatus,
	getUnreadCount,
};
