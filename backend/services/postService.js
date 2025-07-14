const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { deleteCommentAndDescendants } = require('./commentService');

/**
 * Hard deletes all posts authored by a user.
 * @param {string|ObjectId} userId - The user ID
 * @param {Object} session - Mongoose session (optional)
 * @returns {Promise<Object>} - The delete result
 */
const deletePostsByUser = async (userId, session = null) => {
	const filter = { author: userId };
	const options = session ? { session } : {};
	return Post.deleteMany(filter, options);
};

/**
 * Removes a user from the likes array of all posts.
 * @param {string|ObjectId} userId - The user ID
 * @param {Object} session - Mongoose session (optional)
 * @returns {Promise<Object>} - The update result
 */
const removeUserFromPostLikes = async (userId, session = null) => {
	const filter = { likes: userId };
	const update = { $pull: { likes: userId } };
	const options = session ? { session } : {};
	return Post.updateMany(filter, update, options);
};

/**
 * Recursively hard deletes a post and all its comments (and their descendants).
 * @param {string|ObjectId} postId - The post ID
 * @param {Object} session - Mongoose session (optional)
 * @returns {Promise<void>}
 */
const deletePostAndComments = async (postId, session = null) => {
	const options = session ? { session } : {};
	// Find all top-level comments for the post
	const comments = await Comment.find({ post: postId }, null, options);
	for (const comment of comments) {
		await deleteCommentAndDescendants(comment._id, session);
	}
	// Delete the post itself
	await Post.deleteOne({ _id: postId }, options);
};

module.exports = {
	deletePostsByUser,
	removeUserFromPostLikes,
	deletePostAndComments,
};
