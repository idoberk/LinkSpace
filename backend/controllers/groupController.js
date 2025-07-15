const mongoose = require('mongoose');
const Group = require('../models/Group');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { handleErrors } = require('../middleware/errorHandler');
const { createError } = require('../utils/errorUtils');
const {
	getTransformationOptions,
	processSingleFile,
	deleteMediaFiles,
} = require('../services/mediaService');
const { parseFormData } = require('../utils/parseFormData');
const { deleteGroupAndContent } = require('../services/groupService');
const { PAST_30_DAYS } = require('../utils/constants');
const { updateUserStat } = require('../services/userService');
const { updateGroupStat } = require('../services/groupService');

const createGroup = async (req, res) => {
	let group = null;

	try {
		const { name, description, privacy, category, settings } = req.body;
		const creatorId = req.user.userId;

		group = new Group({
			name,
			description,
			privacy: privacy || 'public',
			category: category || 'other',
			creator: creatorId,
			admins: [creatorId],
			members: [
				{
					user: creatorId,
					status: 'approved',
					joinedAt: new Date(),
				},
			],
			settings: settings || {},
		});

		await group.save();

		if (req.file) {
			try {
				const uploadOptions = {
					folder: `linkspace/groups/${group._id}/media`,
					transformation: getTransformationOptions('cover'),
				};

				const coverImageData = await processSingleFile(
					req.file.buffer,
					uploadOptions,
				);

				group.coverImage = {
					url: coverImageData.url,
					publicId: coverImageData.publicId,
				};

				await group.save();
			} catch (uploadError) {
				console.log(`Cover image upload failed: ${uploadError}`);
			}
		}

		await User.findByIdAndUpdate(creatorId, {
			$push: { groups: group._id },
		});

		await group.populate([
			{
				path: 'creator',
				select: 'profile.firstName profile.lastName profile.avatar',
			},
			{
				path: 'admins',
				select: 'profile.firstName profile.lastName profile.avatar',
			},
			{
				path: 'members.user',
				select: 'profile.firstName profile.lastName profile.avatar',
			},
		]);

		res.status(201).json({ message: 'Group created successfully', group });
	} catch (error) {
		if (group && group._id) {
			await Group.findByIdAndDelete(group._id);
			await User.findByIdAndUpdate(group.creator, {
				$pull: { groups: group._id },
			});
		}

		if (group && group.coverImage) {
			await deleteMediaFiles([group.coverImage]);
		}

		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

const updateGroup = async (req, res) => {
	let uploadedCoverImage = null;

	try {
		const parsedFormData = parseFormData(req.body);
		const { name, description, privacy, category, settings } =
			parsedFormData;
		const group = req.group;

		if (name && name !== group.name) {
			group.name = name;
		}

		if (req.file) {
			const uploadOptions = {
				folder: `linkspace/groups/${group._id}/media`,
				transformation: getTransformationOptions('cover'),
			};

			const coverImageData = await processSingleFile(
				req.file.buffer,
				uploadOptions,
			);

			if (group.coverImage) {
				await deleteMediaFiles([group.coverImage]);
			}

			group.coverImage = {
				url: coverImageData.url,
				publicId: coverImageData.publicId,
			};
		}

		if (description !== undefined) {
			group.description = description;
		}

		if (privacy !== undefined) {
			group.privacy = privacy;
		}

		if (category !== undefined) {
			group.category = category;
		}

		if (settings !== undefined) {
			group.settings = {
				...group.settings.toObject(),
				...settings,
			};
		}

		group.settings.activity.lastActivity = new Date();

		await group.save();

		await group.populate([
			{
				path: 'creator',
				select: 'profile.firstName profile.lastName profile.avatar',
			},
			{
				path: 'admins',
				select: 'profile.firstName profile.lastName profile.avatar',
			},
			{
				path: 'members.user',
				select: 'profile.firstName profile.lastName profile.avatar',
			},
		]);

		res.json({ message: 'Group updated successfully', group });
	} catch (error) {
		if (uploadedCoverImage) {
			await deleteMediaFiles([uploadedCoverImage]);
		}
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

const deleteGroup = async (req, res) => {
	const session = await mongoose.startSession();

	session.startTransaction();

	try {
		const group = req.group;
		const groupId = group._id;

		await deleteGroupAndContent(groupId, session);

		await User.updateMany(
			{ groups: groupId },
			{ $pull: { groups: groupId } },
			{ session },
		);

		await session.commitTransaction();
		res.json({ message: 'Group deleted successfully' });
	} catch (error) {
		await session.abortTransaction();

		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

const searchGroups = async (req, res) => {
	try {
		const {
			name,
			category,
			createdAfter,
			createdBefore,
			privacy,
			minMembers,
			page = 1,
			limit = 10,
			sortBy = 'createdAt',
			sortOrder = 'desc',
		} = req.query;

		const skip = (page - 1) * limit;
		let andFilters = [];

		if (name) {
			andFilters.push({ name: { $regex: name, $options: 'i' } });
		}

		if (category) {
			andFilters.push({ category });
		}

		if (privacy) {
			andFilters.push({ privacy });
		}

		if (createdAfter || createdBefore) {
			let createdAt = {};
			if (createdAfter) createdAt.$gte = new Date(createdAfter);
			if (createdBefore) createdAt.$lte = new Date(createdBefore);
			andFilters.push({ createdAt });
		}

		if (minMembers) {
			andFilters.push({
				'stats.totalMembers': { $gte: parseInt(minMembers) },
			});
		}

		const query = andFilters.length > 0 ? { $and: andFilters } : {};

		const sort = {};
		sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

		const publicFields =
			'_id name description category privacy coverImage creator admins members stats createdAt updatedAt';

		const groups = await Group.find(query)
			.select(publicFields)
			.populate([
				{
					path: 'creator',
					select: 'profile.firstName profile.lastName profile.avatar',
				},
				{
					path: 'admins',
					select: 'profile.firstName profile.lastName profile.avatar',
				},
				{
					path: 'members.user',
					select: 'profile.firstName profile.lastName profile.avatar',
				},
			])
			.sort(sort)
			.skip(skip)
			.limit(parseInt(limit));

		const total = await Group.countDocuments(query);

		res.json({
			groups,
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

const getGroupById = async (req, res) => {
	try {
		const groupId = req.params.id || req.query.id;
		if (!groupId) {
			return res
				.status(400)
				.json({ errors: { message: 'Group ID is required' } });
		}

		const publicFields =
			'_id name description category privacy coverImage creator admins members stats createdAt updatedAt';
		const group = await Group.findById(groupId)
			.select(publicFields)
			.populate([
				{
					path: 'creator',
					select: 'profile.firstName profile.lastName profile.avatar',
				},
				{
					path: 'admins',
					select: 'profile.firstName profile.lastName profile.avatar',
				},
				{
					path: 'members.user',
					select: 'profile.firstName profile.lastName profile.avatar',
				},
			]);
		if (!group) {
			return res
				.status(404)
				.json({ errors: { message: 'Group not found' } });
		}
		res.json({ group });
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

const joinGroup = async (req, res) => {
	try {
		const groupId = req.params.id;
		const userId = req.user.userId;
		const group = await Group.findById(groupId);

		const joiningRequiresApproval =
			group.settings?.joiningRequiresApproval !== false;
		const memberStatus = joiningRequiresApproval ? 'pending' : 'approved';

		group.members.push({
			user: userId,
			status: memberStatus,
			joinedAt: new Date(),
		});

		if (memberStatus === 'approved') {
			await User.findByIdAndUpdate(userId, {
				$push: { groups: groupId },
			});
			await updateGroupStat(groupId, 'stats.totalMembers', 1);
		}

		group.settings.activity.lastActivity = new Date();

		await group.save();

		res.json({
			message:
				memberStatus === 'approved'
					? 'Successfully joined the group!'
					: 'Join request sent. Waiting for admin approval.',
			status: memberStatus,
		});
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

const leaveGroup = async (req, res) => {
	try {
		const group = req.group;
		const userId = req.user.userId;

		if (group.creator.toString() === userId) {
			throw createError(
				'Group creator cannot leave the group. Transfer group ownership or delete the group.',
				403,
			);
		}

		const memberIndex = group.members.findIndex(
			(m) => m.user.toString() === userId,
		);

		group.members.splice(memberIndex, 1);

		group.admins = group.admins.filter(
			(admin) => admin.toString() !== userId,
		);

		group.membershipHistory.push({
			user: userId,
			action: 'left',
			date: new Date(),
			performedBy: userId,
		});

		await updateGroupStat(group._id, 'stats.totalMembers', -1);

		group.settings.activity.lastActivity = new Date();

		await group.save();

		await User.findByIdAndUpdate(userId, {
			$pull: { groups: group._id },
		});

		res.json({ message: 'Successfully left the group!' });
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

const handleJoinRequest = async (req, res) => {
	try {
		const group = req.group;
		const requestUserId = req.params.userId;
		const adminId = req.user.userId;
		const { action } = req.body;

		if (!['approve', 'reject'].includes(action)) {
			throw createError(
				'Invalid action. Must be "approve" or "reject"',
				400,
			);
		}

		const memberIndex = group.members.findIndex(
			(m) =>
				m.user.toString() === requestUserId && m.status === 'pending',
		);

		if (memberIndex === -1) {
			throw createError('No pending request found for this user', 404);
		}

		if (action === 'approve') {
			group.members[memberIndex].status = 'approved';
			group.members[memberIndex].joinedAt = new Date();

			await User.findByIdAndUpdate(requestUserId, {
				$push: { groups: group._id },
			});

			group.membershipHistory.push({
				user: requestUserId,
				action: 'joined',
				date: new Date(),
				performedBy: adminId,
			});

			await updateGroupStat(group._id, 'stats.totalMembers', 1);
		} else {
			group.members.splice(memberIndex, 1);
		}

		group.settings.activity.lastActivity = new Date();

		await group.save();

		res.json({
			message:
				action === 'approve'
					? 'User approved successfully!'
					: 'Join request rejected',
		});
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

const removeGroupMember = async (req, res) => {
	try {
		const group = req.group;
		const memberToRemoveId = req.params.userId;
		const adminId = req.user.userId;
		const { reason } = req.body;

		if (group.creator.toString() === memberToRemoveId) {
			throw createError('Cannot remove the group creator', 400);
		}

		group.members = group.members.filter(
			(m) => m.user.toString() !== memberToRemoveId,
		);

		group.admins = group.admins.filter(
			(admin) => admin.toString() !== memberToRemoveId,
		);

		group.membershipHistory.push({
			user: memberToRemoveId,
			action: 'removed',
			date: new Date(),
			performedBy: adminId,
			reason: reason || 'No reason provided',
		});

		await updateGroupStat(group._id, 'stats.totalMembers', -1);
		group.settings.activity.lastActivity = new Date();

		await group.save();

		await User.findByIdAndUpdate(memberToRemoveId, {
			$pull: { groups: group._id },
		});

		res.json({ message: 'Member removed successfully' });
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

const promoteToGroupAdmin = async (req, res) => {
	try {
		const group = req.group;
		const newAdminId = req.params.userId;
		const currentAdminId = req.user.userId;

		if (group.admins.some((admin) => admin.toString() === newAdminId)) {
			throw createError('User is already an admin', 400);
		}

		group.admins.push(newAdminId);

		group.membershipHistory.push({
			user: newAdminId,
			action: 'promoted_to_admin',
			date: new Date(),
			performedBy: currentAdminId,
		});

		group.settings.activity.lastActivity = new Date();

		await group.save();

		res.json({
			message: 'User promoted to admin successfully',
			admins: group.admins,
		});
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

const demoteGroupAdmin = async (req, res) => {
	try {
		const group = req.group;
		const adminToRemoveId = req.params.userId;
		const currentUserId = req.user.userId;

		if (group.creator.toString() === adminToRemoveId) {
			throw createError(
				'Cannot remove admin privileges from the group creator',
				400,
			);
		}

		const adminIndex = group.admins.findIndex(
			(admin) => admin.toString() === adminToRemoveId,
		);
		if (adminIndex === -1) {
			throw createError('User is not an admin', 404);
		}

		group.admins.splice(adminIndex, 1);

		group.membershipHistory.push({
			user: adminToRemoveId,
			action: 'demoted_from_admin',
			date: new Date(),
			performedBy: currentUserId,
		});

		group.settings.activity.lastActivity = new Date();

		await group.save();

		res.json({
			message: 'Admin privileges removed successfully',
			admins: group.admins,
		});
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

const deleteGroupPost = async (req, res) => {
	try {
		const group = req.group;
		const postId = req.params.postId;
		const post = await Post.findById(postId);

		if (!post) {
			throw createError('Post not found', 404);
		}

		if (post.group.toString() !== group._id.toString()) {
			throw createError('This post does not belong to this group', 400);
		}

		if (post.media && post.media.length > 0) {
			await deleteMediaFiles(post.media);
		}

		await Comment.deleteMany({ post: postId });

		await Post.findByIdAndDelete(postId);

		group.stats.totalPosts = Math.max(0, group.stats.totalPosts - 1);

		await Promise.all([
			// Update user stats
			updateUserStat(post.author, 'stats.totalPosts', -1),

			// Update group stats
			Group.findByIdAndUpdate(group._id, {
				$inc: { 'stats.totalPosts': -1 },
				$set: { 'settings.activity.lastActivity': new Date() },
			}),
		]);

		res.json({ message: 'Post deleted successfully' });
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

const banUser = async (req, res) => {
	try {
		const group = req.group;
		const { userId, reason } = req.body;
		const adminId = req.user.userId;

		if (!userId) {
			throw createError('User ID is required', 400);
		}

		if (userId.toString() === adminId.toString()) {
			throw createError('Cannot ban yourself', 403);
		}

		if (group.creator.toString() === userId) {
			throw createError('Cannot ban the group creator', 403);
		}

		if (group.isUserBanned(userId)) {
			throw createError('User is already banned from this group', 400);
		}

		group.members = group.members.filter(
			(m) => m.user.toString() !== userId,
		);

		group.admins = group.admins.filter(
			(admin) => admin.toString() !== userId,
		);

		group.banList.push({
			user: userId,
			bannedAt: new Date(),
			bannedBy: adminId,
			reason: reason || 'No reason provided',
		});

		group.membershipHistory.push({
			user: userId,
			action: 'banned',
			date: new Date(),
			performedBy: adminId,
			reason: reason || 'No reason provided',
		});

		await updateGroupStat(group._id, 'stats.totalMembers', -1);
		await updateGroupStat(group._id, 'stats.totalBanned', 1);
		group.settings.activity.lastActivity = new Date();

		await group.save();

		await User.findByIdAndUpdate(userId, {
			$pull: { groups: group._id },
		});

		res.json({
			message: 'User has been banned from the group',
			bannedUser: userId,
		});
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

const getBannedUsers = async (req, res) => {
	try {
		const group = req.group;
		const { page = 1, limit = 10 } = req.query;
		const skip = (page - 1) * limit;

		await group.populate({
			path: 'banList.user',
			select: 'profile.firstName profile.lastName profile.avatar email',
			options: {
				skip: skip,
				limit: parseInt(limit),
			},
		});

		await group.populate({
			path: 'banList.bannedBy',
			select: 'profile.firstName profile.lastName',
		});

		const bannedUsers = group.banList.slice(skip, skip + parseInt(limit));
		const total = group.banList.length;

		res.json({
			bannedUsers,
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

const getMembershipHistory = async (req, res) => {
	try {
		const group = req.group;
		const { page = 1, limit = 20, userId, action } = req.query;
		const skip = (page - 1) * limit;

		let query = {};
		if (userId) query.user = userId;
		if (action) query.action = action;

		let filteredHistory = group.membershipHistory;
		if (userId) {
			filteredHistory = filteredHistory.filter(
				(h) => h.user.toString() === userId,
			);
		}
		if (action) {
			filteredHistory = filteredHistory.filter(
				(h) => h.action === action,
			);
		}

		filteredHistory.sort((a, b) => b.date - a.date);

		const paginatedHistory = filteredHistory.slice(
			skip,
			skip + parseInt(limit),
		);

		await group.populate({
			path: 'membershipHistory.user',
			select: 'profile.firstName profile.lastName profile.avatar',
		});

		await group.populate({
			path: 'membershipHistory.performedBy',
			select: 'profile.firstName profile.lastName',
		});

		res.json({
			history: paginatedHistory,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total: filteredHistory.length,
				pages: Math.ceil(filteredHistory.length / limit),
			},
		});
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

const getPendingMembers = async (req, res) => {
	try {
		const group = req.group;
		const { page = 1, limit = 10 } = req.query;
		const skip = (page - 1) * limit;

		const pendingMembers = group.members.filter(
			(m) => m.status === 'pending',
		);

		const paginatedPending = pendingMembers.slice(
			skip,
			skip + parseInt(limit),
		);

		await group.populate({
			path: 'members.user',
			select: 'profile.firstName profile.lastName profile.avatar email createdAt',
		});

		const pendingWithInfo = paginatedPending.map((member) => ({
			_id: member._id,
			user: member.user,
			requestedAt: member.joinedAt,
			status: member.status,
		}));

		res.json({
			pendingMembers: pendingWithInfo,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total: pendingMembers.length,
				pages: Math.ceil(pendingMembers.length / limit),
			},
		});
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

const getGroupStats = async (req, res) => {
	try {
		const group = req.group;
		const groupId = group._id;
		const approvedMembers = group.members.filter(
			(m) => m.status === 'approved',
		);
		const pendingMembers = group.members.filter(
			(m) => m.status === 'pending',
		);
		const last30Days = new Date(Date.now() - PAST_30_DAYS);
		const recentPosts = await Post.countDocuments({
			group: groupId,
			createdAt: { $gte: last30Days },
		});

		const topContributors = await Post.aggregate([
			{ $match: { group: groupId } }, // Filter posts to only those belonging to this specific group
			{
				$group: {
					_id: '$author', // Group posts by author and sum them
					postCount: { $sum: 1 },
				},
			},
			{ $sort: { postCount: -1 } }, // Sort post count by descending order (user with most posts appears first)
			{ $limit: 5 },
			{
				$lookup: {
					// Join with the users collection to get user details
					from: 'users',
					localField: '_id',
					foreignField: '_id',
					as: 'user',
				},
			},
			{ $unwind: '$user' }, // Covert the user array created by the $lookup into a single object
			{
				$project: {
					// Select only the fields from the user we need
					_id: 1,
					postCount: 1,
					'user.profile.firstName': 1,
					'user.profile.lastName': 1,
					'user.profile.avatar': 1,
				},
			},
		]);

		const stats = {
			general: {
				name: group.name,
				category: group.category,
				privacy: group.privacy,
				createdAt: group.createdAt,
				creator: group.creator,
			},
			members: {
				total: approvedMembers.length,
				pending: pendingMembers.length,
				admins: group.admins.length,
				banned: group.banList.length,
			},
			posts: {
				total: group.stats.totalPosts,
				last30Days: recentPosts,
				monthlyBreakdown: group.stats.monthlyPosts.slice(-6), // Last 6 months
				topContributors,
			},
			activity: {
				lastActivity: group.settings.activity.lastActivity,
				isActive:
					new Date(group.settings.activity.lastActivity) > last30Days,
			},
			moderation: {
				totalBans: group.banList.length,
				recentBans: group.banList.filter(
					(ban) => new Date(ban.bannedAt) >= last30Days,
				).length,
				totalRemovals: group.membershipHistory.filter(
					(h) => h.action === 'removed',
				).length,
			},
		};

		res.json(stats);
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

const getGroupStatsPublic = async (req, res) => {
	try {
		const group = await Group.findById(req.params.id);
		if (!group) return res.status(404).json({ error: 'Group not found' });

		res.json({
			name: group.name,
			category: group.category,
			privacy: group.privacy,
			createdAt: group.createdAt,
			totalMembers: group.stats.totalMembers,
			totalPosts: group.stats.totalPosts,
			totalBanned: group.stats.totalBanned,
			monthlyPosts: group.stats.monthlyPosts?.slice(-6) || [],
		});
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

module.exports = {
	createGroup,
	updateGroup,
	deleteGroup,
	searchGroups,
	getGroupById,
	joinGroup,
	leaveGroup,
	handleJoinRequest,
	removeGroupMember,
	promoteToGroupAdmin,
	demoteGroupAdmin,
	deleteGroupPost,
	banUser,
	getBannedUsers,
	getMembershipHistory,
	getPendingMembers,
	getGroupStats,
	getGroupStatsPublic,
};
