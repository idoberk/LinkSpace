const Comment = require('../models/Comment');

/**
 * Soft deletes all comments for a given post (does not remove from DB).
 * @param {string|ObjectId} postId - The post ID
 * @param {Object} session - Mongoose session (optional)
 * @returns {Promise<void>}
 */
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

/**
 * Soft deletes all comments authored by a user (does not remove from DB).
 * @param {string|ObjectId} userId - The user ID
 * @param {Object} session - Mongoose session (optional)
 * @returns {Promise<void>}
 */
const deleteUserComments = async (userId, session) => {
	try {
		// Find all comments made by the specific user and get the _id and parentComment fields
		const userComments = await Comment.find(
			{ author: userId, isDeleted: false },
			'_id parentComment',
			{ session },
		);

		for (const comment of userComments) {
			await comment.softDelete(session);
		}
	} catch (error) {
		console.error(`Error deleting comments for user ${userId}:`, error);
		throw error;
	}
};

/**
 * Recursively hard deletes a comment and all its descendants.
 * @param {string|ObjectId} commentId - The comment ID
 * @param {Object} session - Mongoose session (optional)
 * @returns {Promise<void>}
 */
const deleteCommentAndDescendants = async (commentId, session) => {
	// Find all direct children
	const children = await Comment.find(
		{ parentComment: commentId },
		null,
		session ? { session } : {},
	);
	// Recursively delete each child and its descendants
	for (const child of children) {
		await deleteCommentAndDescendants(child._id, session);
	}
	// Delete the comment itself
	await Comment.deleteOne({ _id: commentId }, session ? { session } : {});
};

/**
 * Recursively hard deletes all comments by a user, including all descendants.
 * @param {string|ObjectId} userId - The user ID
 * @param {Object} session - Mongoose session (optional)
 * @returns {Promise<void>}
 */
const deleteCommentsByUser = async (userId, session = null) => {
	const options = session ? { session } : {};
	// Find all comments by the user
	const userComments = await Comment.find({ author: userId }, null, options);
	// Recursively delete each comment and its descendants
	for (const comment of userComments) {
		await deleteCommentAndDescendants(comment._id, session);
	}
};

/**
 * Atomically increments or decrements a comment's stat field.
 * @param {string|ObjectId} commentId - The comment ID
 * @param {string} statField - The stats field to update (e.g., 'stats.totalReplies')
 * @param {number} increment - The amount to increment (or decrement)
 * @param {Object} [session] - Optional mongoose session
 * @returns {Promise<Object>} - The update result
 */
const updateCommentStat = async (
	commentId,
	statField,
	increment,
	session = null,
) => {
	const update = { $inc: { [statField]: increment } };
	const options = session ? { session } : {};
	return Comment.findByIdAndUpdate(commentId, update, options);
};

module.exports = {
	deletePostComments,
	deleteUserComments,
	deleteCommentAndDescendants,
	deleteCommentsByUser,
	updateCommentStat,
};
