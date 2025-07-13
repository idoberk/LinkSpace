const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
	{
		participants: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
				required: true,
			},
		],
		lastMessage: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Message',
			default: null,
		},
		lastMessageAt: {
			type: Date,
			default: Date.now,
		},
		unreadCount: {
			type: Map,
			of: Number,
			default: new Map(),
		},
		typing: {
			type: Map,
			of: Boolean,
			default: new Map(),
		},
	},
	{
		timestamps: true,
	},
);

conversationSchema.pre('save', function (next) {
	// Check that the participants are 2 different users to prevent self-messaging
	this.participants = [...new Set(this.participants)].sort();

	if (this.participants.length !== 2) {
		return next(
			new Error(
				'Direct message conversations must have exactly 2 participants',
			),
		);
	}

	next();

	/* if (this.participants[0].toString() === this.participants[1].toString()) {
		return next(new Error('Users cannot message themselves'));
	} */
});

conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

conversationSchema.statics.findOrCreateConversation = async function (
	user1Id,
	user2Id,
) {
	if (!user1Id || !user2Id) {
		throw new Error('Both user IDs are required');
	}

	const participants = [user1Id, user2Id].sort();

	let conversation = await this.findOne({ participants });

	if (!conversation) {
		conversation = new this({
			participants,
			unreadCount: new Map([
				[user1Id.toString(), 0],
				[user2Id.toString(), 0],
			]),
			typing: new Map([
				[user1Id.toString(), false],
				[user2Id.toString(), false],
			]),
		});
		await conversation.save();
	}

	return conversation;
};

conversationSchema.methods.incrementUnreadCount = function (userId) {
	const currentCount = this.unreadCount.get(userId.toString()) || 0;
	this.unreadCount.set(userId.toString(), currentCount + 1);
};

conversationSchema.methods.resetUnreadCount = function (userId) {
	this.unreadCount.set(userId.toString(), 0);
};

conversationSchema.methods.setTypingStatus = function (userId, isTyping) {
	this.typing.set(userId.toString(), isTyping);
	return this.save();
};

module.exports = mongoose.model('Conversation', conversationSchema);
