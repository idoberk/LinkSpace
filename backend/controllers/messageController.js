const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const conversationService = require('../services/conversationService');
const messageService = require('../services/messageService');
const { handleErrors } = require('../middleware/errorHandler');

const createMessage = async (req, res, next) => {
	try {
		const {
			conversationId,
			content,
			messageType = 'text',
			media = null,
		} = req.body;
		const senderId = req.user.userId;

		const message = await messageService.createMessage(
			conversationId,
			senderId,
			content,
			messageType,
			media,
		);

		res.status(201).json({ message });
	} catch (error) {
		const errors = handleErrors(error);
		next(errors);
	}
};

const getConversationWithUser = async (req, res, next) => {
	try {
		const { userId: otherUserId } = req.params;
		const currentUserId = req.user.userId;
		const conversation = await conversationService.getOrCreateConversation(
			currentUserId,
			otherUserId,
		);

		res.json({ conversation });
	} catch (error) {
		next(error);
	}
};

const getConversations = async (req, res) => {
	try {
		const userId = req.user.userId;
		const conversations = await Conversation.find({
			participants: userId,
		})
			.populate(
				'participants',
				'profile.firstName profile.lastName profile.avatar status.isOnline status.isActive status.lastSeen settings.privacy.showOnlineStatus',
			)
			.populate('lastMessage')
			.sort({ lastMessageAt: -1 });

		conversations.forEach((conversation) => {
			conversation.participants.forEach((participant) => {
				if (
					participant.settings?.privacy?.showOnlineStatus ===
					'private'
				) {
					participant.status = {
						isOnline: null,
						isActive: null,
						lastSeen: null,
					};
				}
			});
		});

		res.json({ conversations });
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

module.exports = { createMessage, getConversationWithUser, getConversations };
