const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
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
			// Convert unreadCount Map to plain object for frontend
			if (conversation.unreadCount instanceof Map) {
				conversation.unreadCount = Object.fromEntries(
					conversation.unreadCount,
				);
			}
		});

		res.json({ conversations });
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

const getMessagesForConversation = async (req, res) => {
	try {
		const { conversationId } = req.params;
		const userId = req.user.userId;

		const conversation = await Conversation.findById(conversationId);
		if (!conversation || !conversation.participants.includes(userId)) {
			return res.status(403).json({
				errors: { message: 'Access denied' },
			});
		}

		const messages = await Message.find({ conversation: conversationId })
			.sort({ createdAt: 1 })
			.populate(
				'sender',
				'profile.firstName profile.lastName profile.avatar',
			);

		return res.status(200).json({
			message: 'Messages fetched successfully',
			messages: messages.map((msg) => msg.toObject()),
		});
	} catch (error) {
		const errors = handleErrors(error);
		return res.status(errors.status || 500).json({ errors });
	}
};

module.exports = {
	createMessage,
	getConversationWithUser,
	getConversations,
	getMessagesForConversation,
};
