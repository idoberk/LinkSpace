const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { createError } = require('../utils/errorUtils');

const deletePostComments = async (postId, session) => {
	try {
		const comments = await Comment.find(
			{ post: postId, isDeleted: false },
			{ session },
		);

		for (const comment of comments) {
			await comment.softDelete(session);
		}
	} catch (error) {
		console.error(`Error deleting comments for post ${postId}:`, error);
		throw error;
	}
};

const deleteUserComments = async (userId, session) => {
	try {
		// Find all comments made by the specific user and get the _id and parentComment fields
		const userComments = await Comment.find(
			{ author: userId, isDeleted: false },
			'_id parentComment',
			{ session },
		);
		/* const parentCounts = {};

		// Create a map to track how many replies each parent comment (if there are any), will lose
        // If a comment has a parentComment, it increments the count for that specific parentComment
		userComments.forEach((comment) => {
			if (comment.parentComment) {
				parentCounts[comment.parentComment] =
					(parentCounts[comment.parentComment] || 0) + 1;
			}
		});

		// For each parentComment that will lose replies, decrements the totalReplies count
		for (const [parentId, count] of Object.entries(parentCounts)) {
			await Comment.findByIdAndUpdate(
				parentId,
				{ $inc: { 'stats.totalReplies': -count } },
				{ session },
			);
		}

		const commentIds = userComments.map((comment) => comment._id);

		// Find all posts that contain any of the commentIds
		await Post.updateMany(
			{ comments: { $in: commentIds } },
			{ $pull: { comments: { $in: commentIds } } },
			{ session },
		); */

		// Delete the comments
		for (const comment of userComments) {
			await comment.softDelete(session);
		}
	} catch (error) {
		console.error(`Error deleting comments for user ${userId}:`, error);
		throw error;
	}
};

module.exports = { deletePostComments, deleteUserComments };
