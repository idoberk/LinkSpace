const Post = require('../models/Post');
const User = require('../models/User');
const Group = require('../models/Group');
const { handleErrors } = require('../middleware/errorHandler');

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
		console.log(postId);

		const post = await Post.findById(postId)
			.populate('author', '_id')
			.populate('group', 'privacy members');

		if (!post) {
			return res.status(400).json({ error: 'Post not found' });
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
				if (!userId || post.author._id.toString() !== userId) {
					return res.status(403).json({
						error: 'You do not have permissions to view this post',
					});
				}

				req.post = post;
				return next();

			case 'friends': {
				if (!userId) {
					return res.status(401).json({
						error: 'Authentication required to view this post',
					});
				}

				const author = await User.findById(post.author._id);

				if (!author.isFriendsWith(userId)) {
					return res
						.status(403)
						.json({ error: 'Only friends can view this post' });
				}

				req.post = post;

				return next();
			}

			case 'group': {
				if (!userId) {
					return res.status(401).json({
						error: 'Authentication required to view this post',
					});
				}

				if (!post.group) {
					return res
						.status(404)
						.json({ error: 'Group not found for this post' });
				}

				const isMember = post.group.members.some(
					(member) =>
						member.user.toString() === userId &&
						member.status === 'approved',
				);

				if (!isMember && post.group.privacy === 'private') {
					return res.status(403).json({
						error: 'Only group members can view this post',
					});
				}

				req.post = post;

				return next();
			}

			default:
				return res
					.status(400)
					.json({ error: 'Invalid post visibility settings' });
		}
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

module.exports = { validatePostSearchParams, canViewPost };
