const Post = require('../models/Post');
const User = require('../models/User');
const Group = require('../models/Group');
const { handleErrors } = require('../middleware/errorHandler');

// TODO: Timezone related places: searching objects (posts, comments...) based on dates.
// TODO: Add update / delete post methods?

const createPost = async (req, res) => {
	try {
		const { content, visibility, tags, groupId, media } = req.body;
		const authorId = req.user.userId;

		if (groupId) {
			const group = await Group.findById(groupId);

			if (!group) {
				return res.status(404).json({ error: 'Group not found' });
			}

			const isMember = group.members.some(
				(member) =>
					member.user.toString() === authorId &&
					member.status === 'approved',
			);

			if (!isMember) {
				return res.status(403).json({
					error: 'You must be an approved member to post in this group',
				});
			}
		}

		const post = new Post({
			content,
			author: authorId,
			group: groupId || null,
			visibility: groupId ? 'group' : visibility || 'public',
			tags: tags || [],
			media: media || [],
		});

		await post.save();
		await post.populate(
			'author',
			'profile.firstName profile.lastName profile.avatar',
		);

		await User.findByIdAndUpdate(authorId, {
			$inc: { 'stats.totalPosts': 1 },
		});

		if (groupId) {
			const currentMonth = new Date().toLocaleString('en-US', {
				month: 'long',
			});
			const currentYear = new Date().getFullYear();

			await Group.findByIdAndUpdate(groupId, {
				$inc: { 'stats.totalPosts': 1 },
			});

			const group = await Group.findById(groupId);
			const monthlyStatIndex = group.stats.monthlyPosts.findIndex(
				(stat) =>
					stat.month === currentMonth && stat.year === currentYear,
			);

			if (monthlyStatIndex > -1) {
				group.stats.monthlyPosts[monthlyStatIndex].count += 1;
			} else {
				group.stats.monthlyPosts.push({
					month: currentMonth,
					year: currentYear,
					count: 1,
				});
			}

			await group.save();
		}

		res.status(201).json({
			message: 'Post created successfully',
			post,
		});
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

const searchPosts = async (req, res) => {
	try {
		const {
			content,
			author,
			dateFrom,
			dateTo,
			tags,
			visibility,
			groupId,
			page = 1,
			limit = 10,
		} = req.query;
		const skip = (page - 1) * limit;
		const userId = req.user?.userId;

		let query = {};

		if (content) {
			query.$text = { $search: content };
		}

		if (author) {
			const users = await User.find({
				$or: [
					{ 'profile.firstName': { $regex: author, $options: 'i' } }, // Match by first name
					{ 'profile.lastName': { $regex: author, $options: 'i' } }, // Match by last name
				],
			});

			const authorIds = users.map((user) => user._id);

			query.author = { $in: authorIds };
		}

		if (dateFrom || dateTo) {
			query.createdAt = {};
			if (dateFrom) {
				query.createdAt.$gte = new Date(dateFrom);
			}
			if (dateTo) {
				query.createdAt.$lte = new Date(dateTo);
			}
		}

		if (tags) {
			const tagsArray = Array.isArray(tags) ? tags : tags.split(',');
			query.tags = { $in: tagsArray };
		}

		/* if (visibility) {
			query.visibility = visibility;
		} */

		if (groupId) {
			query.groupId = groupId;
		}

		if (!userId) {
			query.visibility = 'public';
		} else {
			const user = await User.findById(userId);

			const userGroups = user.groups;

			// If a specific visibility is requested, only include it if the user has permission
			if (visibility) {
				// If specific visibility is requested
				if (visibility === 'friends') {
					// For friends visibility, we need to check if the post author is in the user's friends list
					query.$and = [
						{ visibility: 'friends' },
						{ author: { $in: user.friends } },
					];
				} else if (visibility === 'public') {
					query.visibility = 'public';
				} else if (visibility === 'group') {
					query.$and = [
						{ visibility: 'group' },
						{ group: { $in: user.groups } },
					];
				}
			} else {
				// If no specific visibility is requested, show all posts user has permission to see
				query.$or = [
					{ visibility: 'public' },
					{ author: userId },
					{
						$and: [
							{ visibility: 'friends' },
							{ author: { $in: user.friends } },
						],
					},
					{
						$and: [
							{ visibility: 'group' },
							{ group: { $in: user.groups } },
						],
					},
				];
			}
		}

		const posts = await Post.find(query)
			.populate(
				'author',
				'profile.firstName profile.lastName profile.avatar',
			)
			.populate('group', 'name')
			.sort({ createdAt: -1 })
			.limit(parseInt(limit))
			.skip(skip);

		const total = await Post.countDocuments(query);

		res.json({
			posts,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

const getAllPosts = async (req, res) => {
	try {
		const { page = 1, limit = 10, sortBy = 'createdAt' } = req.query;
		const skip = (page - 1) * limit;
		const query = { visibility: 'public' }; // Only show public posts for non-authenticated users.
		const posts = await Post.find(query)
			.populate(
				'author',
				'profile.firstName profile.lastName profile.avatar',
			)
			.populate('group', 'name')
			.sort({ [sortBy]: -1 })
			.limit(parseInt(limit))
			.skip(skip);

		const total = await Post.countDocuments(query);

		res.json({
			posts,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

module.exports = {
	createPost,
	searchPosts,
	getAllPosts,
};
