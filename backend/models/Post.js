const mongoose = require('mongoose');
const { MAX_CONTENT_LENGTH } = require('../utils/constants');

const postSchema = new mongoose.Schema(
	{
		content: {
			type: String,
			required: true,
			maxLength: MAX_CONTENT_LENGTH,
		},
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		group: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Group',
		},
		media: [
			{
				type: {
					type: String,
					enum: ['image', 'video'],
				},
				url: String,
				publicId: String,
				format: String,
				width: String,
				height: String,
				bytes: Number,
				// Thumbnail: String,?
			},
		],
		comments: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Comment',
			},
		],
		likes: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
			},
		],
		visibility: {
			type: String,
			enum: ['public', 'friends', 'group', 'private'],
			default: 'public',
		},
		tags: [String],
	},
	{
		timestamps: true,
	},
);

// Index for search functionality
postSchema.index({ content: 'text' });
postSchema.index({ tags: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
