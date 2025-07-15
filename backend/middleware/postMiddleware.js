const Post = require('../models/Post');
const User = require('../models/User');
const Group = require('../models/Group');
const { handleErrors } = require('../middleware/errorHandler');
const { createError } = require('../utils/errorUtils');
const createValidationMiddleware = require('./validationMiddleware');

const postValidation = createValidationMiddleware(Post, {
	notFoundMessage: 'Post not found',
	itemName: 'post',
	authorField: 'author',
});

const validatePostSearchParams = (req, res, next) => {
	const { page, limit, ...searchParams } = req.query;

	if (Object.keys(searchParams).length === 0) {
		return res.status(400).json({
			error: 'At least one search parameter is required',
			requiredParams: {
				content: 'Search in post content',
				author: 'Filter by author ID',
				dateFrom: 'Filter by start date',
				dateTo: 'Filter by end date',
				tags: 'Filter by tags',
				visibility: 'Filter by visibility',
				groupId: 'Filter by group',
			},
		});
	}

	next();
};

const canViewPost = async (req, res, next) => {
	try {
		const postId = req.params.id;
		const userId = req.user?.userId;

		const post = await Post.findById(postId)
			.populate('author', '_id')
			.populate('group', 'privacy members');

		if (!post) {
			throw createError('Post not found', 404);
		}

		if (userId && post.author._id.toString() === userId) {
			req.post = post;
			return next();
		}

		switch (post.visibility) {
			case 'public': // Anyone can view public posts
				req.post = post;
				return next();

			case 'private': // Only the creator of the post can view private posts
				if (post.author._id.toString() !== userId) {
					throw createError(
						'You do not have permissions to view this post',
						403,
					);
				}

				req.post = post;
				return next();

			case 'friends': {
				const author = await User.findById(post.author._id);

				if (!author.isFriendsWith(userId)) {
					throw createError('Only friends can view this post', 403);
				}

				req.post = post;

				return next();
			}

			case 'group': {
				if (!post.group) {
					throw createError('Group not found for this post', 404);
				}

				const isMember = post.group.members.some(
					(member) =>
						member.user.toString() === userId &&
						member.status === 'approved',
				);

				if (!isMember && post.group.privacy === 'private') {
					throw createError(
						'Only group members can view this post',
						403,
					);
				}

				req.post = post;

				return next();
			}

			default:
				throw createError('Invalid post visibility settings', 400);
		}
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

const isPostAuthor = postValidation.checkAuthor('id');

const canCreateGroupPost = async (req, res, next) => {
	try {
		const { groupId } = req.body;
		const userId = req.user?.userId;
		if (groupId) {
			const group = await Group.findById(groupId);
			if (!group) {
				return res.status(404).json({ error: 'Group not found' });
			}
			const isMember = group.members.some(
				(member) =>
					member.user.toString() === userId &&
					member.status === 'approved',
			);
			if (!isMember) {
				return res.status(403).json({
					error: 'You must be an approved member to post in this group',
				});
			}
		}
		next();
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status || 500).json({ errors });
	}
};

module.exports = {
	validatePostSearchParams,
	canViewPost,
	isPostAuthor,
	canCreateGroupPost,
};
