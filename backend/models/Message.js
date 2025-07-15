const mongoose = require('mongoose');
const {
	MAX_CONTENT_LENGTH,
	TIME_ALLOWED_TO_EDIT,
} = require('../utils/constants');
const { createError } = require('../utils/errorUtils');

const messageSchema = new mongoose.Schema(
	{
		sender: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		conversation: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Conversation',
			required: true,
		},
		content: {
			type: String,
			required: [true, 'Message content is required'],
			trim: true,
			maxLength: [
				MAX_CONTENT_LENGTH,
				`Message cannot exceed ${MAX_CONTENT_LENGTH} characters`,
			],
		},
		messageType: {
			type: String,
			enum: ['text', 'image', 'video'],
			default: 'text',
		},
		media: {
			url: String,
			publicId: String,
			fileName: String,
			fileSize: Number,
		},
		readAt: {
			type: Date,
			default: null,
		},
		isRead: {
			type: Boolean,
			default: false,
		},
		editedAt: {
			type: Date,
			default: null,
		},
		isEdited: {
			type: Boolean,
			default: false,
		},
		deletedAt: {
			type: Date,
			default: null,
		},
		isDeleted: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	},
);

messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ conversation: 1, isRead: 1, createdAt: -1 });
messageSchema.index({ readAt: 1 });

/* messageSchema.virtual('isRead').get(function () {
	return !!this.readAt; // Convert any value to a boolean --> same as doing this.readAt ? true : false
}); */

messageSchema.virtual('canEdit').get(function () {
	if (this.isDeleted) return false;
	const timeSinceCreated = Date.now() - this.createdAt.getTime();

	return timeSinceCreated <= TIME_ALLOWED_TO_EDIT;
});

messageSchema.methods.markAsRead = function () {
	if (!this.readAt) {
		this.readAt = new Date();
		this.isRead = true;
		return this.save();
	}

	return Promise.resolve(this);
};

messageSchema.methods.softDelete = function () {
	this.isDeleted = true;
	this.deletedAt = new Date();
	this.content = '[This message was deleted]';

	return this.save();
};

messageSchema.methods.edit = function (newContent) {
	if (!this.canEdit) {
		throw createError('Message can no longer be edited', 403);
	}
	this.content = newContent;
	this.isEdited = true;
	this.editedAt = new Date();

	return this.save();
};

module.exports = mongoose.model('Message', messageSchema);
