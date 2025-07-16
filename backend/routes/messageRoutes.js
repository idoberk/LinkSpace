const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authenticate = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/conversations', messageController.getConversations);
router.get(
	'/conversations/user/:userId',
	messageController.getConversationWithUser,
);
router.get('/:conversationId', messageController.getMessagesForConversation);

router.post('/', messageController.createMessage);

module.exports = router;
