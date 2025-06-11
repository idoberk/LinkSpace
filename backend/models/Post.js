const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
	{
		content: {
			type: String,
			required: true,
			maxLength: 350,
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
					enum: ['image', 'video', 'canvas'],
				},
				url: String,
				// Thumbnail?
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
postSchema.index({ content: 'text', tags: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
