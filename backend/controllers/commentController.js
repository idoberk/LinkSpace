const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');
const { toggleLike } = require('../services/likeService');
const { handleErrors } = require('../middleware/errorHandler');
const { createError } = require('../utils/errorUtils');

const createComment = async (req, res) => {
	try {
		const { content, parentCommentId } = req.body;
		const postId = req.params.id;
		const authorId = req.user.userId;

		if (!content || content.trim().length === 0) {
			throw createError('Comment content is required', 400);
		}

		const post = await Post.findById(postId);

		if (!post) {
			throw createError('Post not found', 404);
		}

		let parentComment = null;
		let depth = 0;

		if (parentCommentId) {
			parentComment = await Comment.findById(parentCommentId);

			if (!parentComment) {
				throw createError('Parent comment not found', 404);
			}

			if (parentComment.post.toString() !== postId) {
				throw createError(
					'Parent comment does not belong to this post',
					400,
				);
			}

			if (parentComment.isDeleted) {
				throw createError('Cannot reply to a deleted comment', 400);
			}

			depth = parentComment.depth + 1;

			if (depth > 3) {
				throw createError('Maximum comment nesting depth reached', 400);
			}
		}

		const comment = new Comment({
			post: postId,
			author: authorId,
			content: content.trim(),
			parentComment: parentCommentId || null,
			depth,
		});

		await comment.save();

		if (parentComment) {
			parentComment.stats.totalReplies += 1;
			await parentComment.save();
		}

		post.comments.push(comment._id);
		await post.save();

		await comment.populate(
			'author',
			'profile.firstName profile.lastName profile.avatar',
		);

		res.status(201).json({
			message: 'Comment created successfully',
			comment: {
				...comment.toObject(),
			},
		});
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

const updateComment = async (req, res) => {
	try {
		const { content } = req.body;
		const commentId = req.params.id;

		if (!content || content.trim().length === 0) {
			throw createError('Comment content is required', 400);
		}

		const comment = await Comment.findById(commentId);

		await comment.edit(content.trim());

		await comment.populate(
			'author',
			'profile.firstName profile.lastName profile.avatar',
		);

		res.json({
			message: 'Comment updated successfully',
			comment: {
				...comment.toObject(),
			},
		});
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

const deleteComment = async (req, res) => {
	try {
		const commentId = req.params.id;
		const userId = req.user.userId;
		const comment = await Comment.findById(commentId);

		await comment.softDelete();

		res.json({
			message: 'Comment deleted successfully',
			comment: {
				...comment.toObject(),
			},
		});
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

const likeComment = async (req, res) => {
	try {
		const commentId = req.params.id;
		const userId = req.user.userId;

		const result = await toggleLike(Comment, commentId, userId, {
			deletedField: 'isDeleted',
			statsField: 'stats.totalLikes',
		});

		res.json({
			message: `Comment ${result.action} successfully`,
			likeCount: result.likeCount,
			isLiked: result.isLiked,
		});
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

const getPostComments = async (req, res) => {
	try {
		const postId = req.params.id;
		const { sortBy = 'newest', page = 1, limit = 20 } = req.query;
		const userId = req.user.userId;
		/* const post = await Post.findById(postId);

		if (!post) {
			throw createError('Post not found', 404);
		} */

		const comments = await Comment.getCommentsWithReplies(postId, userId);

		let sortedComments = [...comments];

		switch (sortBy) {
			case 'oldest':
				sortedComments.sort(
					(a, b) => new Date(a.createdAt) - new Date(b.createdAt),
				);
				break;
			case 'mostLiked':
				sortedComments.sort((a, b) => b.likeCount - a.likeCount);
				break;
			case 'newest':
			default:
				break;
		}

		const startIndex = (page - 1) * limit;
		const paginatedComments = sortedComments.slice(
			startIndex,
			startIndex + parseInt(limit),
		);

		res.json({
			comments: paginatedComments,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total: sortedComments.length,
				pages: Math.ceil(sortedComments.length / limit),
			},
			totalComments: await Comment.countDocuments({ post: postId }),
		});
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

const getComment = async (req, res) => {
	try {
		const commentId = req.params.id;
		const comment = await Comment.findById(commentId)
			.populate(
				'author',
				'profile.firstName profile.lastName profile.avatar',
			)
			.populate('post', 'visibility author group');

		res.json({
			comment: {
				...comment.toObject(),
			},
		});
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

const getAllComments = async (req, res) => {
	try {
		const comments = await Comment.find({ isDeleted: { $ne: true } })
			.populate('author', 'email profile.firstName profile.lastName profile.avatar')
			.populate('post', 'title')
			.populate('parentComment', 'content')
			.sort({ createdAt: -1 });

		res.json({
			comments: comments.map(comment => comment.toObject())
		});
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

module.exports = {
	createComment,
	updateComment,
	deleteComment,
	likeComment,
	getPostComments,
	getComment,
	getAllComments,
};
