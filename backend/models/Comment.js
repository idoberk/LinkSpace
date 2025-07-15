const mongoose = require('mongoose');
const {
	MAX_CONTENT_LENGTH,
	MAX_DEPTH,
	TIME_ALLOWED_TO_EDIT,
} = require('../utils/constants');
const { createError } = require('../utils/errorUtils');

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
			required: true,
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
			max: [MAX_DEPTH, 'Maximum comment depth reached'],
		},
		likes: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
			},
		],
		isEdited: {
			type: Boolean,
			default: false,
		},
		editedAt: {
			type: Date,
		},
		isDeleted: {
			type: Boolean,
			default: false,
		},
		deletedAt: {
			type: Date,
		},
		stats: {
			totalReplies: {
				type: Number,
				default: 0,
			},
			totalLikes: {
				type: Number,
				default: 0,
			},
		},
	},
	{
		timestamps: true,
	},
);

commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1 });
commentSchema.index({ parentComment: 1 });

// Checking if comment can be edited (within TIME_ALLOWED_TO_EDIT (10) minutes)
commentSchema.virtual('canEdit').get(function () {
	if (this.isDeleted) return false;
	const timeSinceCreated = Date.now() - this.createdAt.getTime();

	return timeSinceCreated <= TIME_ALLOWED_TO_EDIT;
});

// Check if a user has liked the comment
commentSchema.methods.isLikedBy = function (userId) {
	return this.likes.some((likeId) => likeId.toString() === userId.toString());
};

// Soft delete a comment
commentSchema.methods.softDelete = function () {
	this.isDeleted = true;
	this.deletedAt = new Date();
	this.content = '[deleted]';

	return this.save();
};

// Edit a comment
commentSchema.methods.edit = function (newContent) {
	if (!this.canEdit) {
		throw createError('Comment can no longer be edited', 403);
	}

	this.content = newContent;
	this.isEdited = true;
	this.editedAt = new Date();

	return this.save();
};

// Get comments with replies
commentSchema.statics.getCommentsWithReplies = async function (postId, userId) {
	const comments = await this.find({
		post: postId,
		depth: 0,
	})
		.populate('author', 'profile.firstName profile.lastName profile.avatar')
		.sort({ createdAt: -1 })
		.lean();

	const loadReplies = async (comment, currDepth = 0) => {
		if (currDepth >= MAX_DEPTH) return comment;

		const replies = await this.find({
			parentComment: comment._id,
		})
			.populate(
				'author',
				'profile.firstName profile.lastName profile.avatar',
			)
			.sort({ createdAt: -1 })
			.lean();

		comment.isLiked = userId
			? comment.likes.some((id) => id.toString() === userId)
			: false;

		comment.canEdit =
			!comment.isDeleted &&
			userId === comment.author._id.toString() &&
			Date.now() - new Date(comment.createdAt).getTime() <=
				TIME_ALLOWED_TO_EDIT;

		if (replies.length > 0) {
			comment.replies = await Promise.all(
				replies.map((reply) => loadReplies(reply, currDepth + 1)),
			);
		} else {
			comment.replies = [];
		}

		return comment;
	};

	const commentsWithReplies = await Promise.all(
		comments.map((comment) => loadReplies(comment)),
	);

	return commentsWithReplies;
};

module.exports = mongoose.model('Comment', commentSchema);
