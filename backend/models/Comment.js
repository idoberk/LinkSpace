const mongoose = require('mongoose');
const { MAX_CONTENT_LENGTH } = require('../utils/constants');

const commentSchema = new mongoose.Schema(
	{
		post: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Post',
			required: true,
		},
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		content: {
			type: String,
			required: true,
			maxLength: MAX_CONTENT_LENGTH,
		},
		parentComment: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Comment',
			default: null,
		},
		depth: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model('Comment', commentSchema);
