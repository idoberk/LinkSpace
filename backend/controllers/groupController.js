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

// TODO: Add a ban and membership history list to handle banning / removing users.

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
		} // TODO: add an option to remove a cover image?

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

const searchGroups = async (req, res) => {};

const getGroupById = async (req, res) => {};

const joinGroup = async (req, res) => {
	try {
		const groupId = req.params.id;
		const userId = req.user.userId;
		const group = await Group.findById(groupId);

		if (!group) {
			throw createError('Group not found', 404);
		}

		const existingMember = group.members.find(
			(m) => m.user.toString() === userId,
		);

		if (existingMember) {
			if (existingMember.status === 'approved') {
				throw createError(
					'You are already a member of this group',
					400,
				);
			} else if (existingMember.status === 'pending') {
				throw createError(
					'You already have a pending request to join this group',
					400,
				);
			} else if (existingMember.status === 'blocked') {
				throw createError(
					'You are blocked from joining this group',
					403,
				);
			}
		}

		const joiningRequiresApproval =
			group.settings?.joiningRequiresApproval !== false;
		const memberStatus = joiningRequiresApproval ? 'pending' : 'approved';

		if (memberStatus === 'approved') {
			await User.findByIdAndUpdate(userId, {
				$push: { groups: groupId },
			});

			group.members.push({
				user: userId,
				status: memberStatus,
				joinedAt: new Date(),
			});

			group.settings.activity.activeMembersCount = group.members.filter(
				(m) => m.status === 'approved',
			).length;
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
		group.settings.activity.activeMembersCount = group.members.filter(
			(m) => m.status === 'approved',
		).length;

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

const getPendingRequests = async (req, res) => {};

const approveJoinRequest = async (req, res) => {};

const rejectJoinRequest = async (req, res) => {};

const removeGroupMember = async (req, res) => {};

const promoteToGroupAdmin = async (req, res) => {};

const demoteGroupAdmin = async (req, res) => {};

const deleteGroupPost = async (req, res) => {};

const getGroupStats = async (req, res) => {};

module.exports = {
	createGroup,
	updateGroup,
	deleteGroup,
	searchGroups,
	getGroupById,
	joinGroup,
	leaveGroup,
	getPendingRequests,
	approveJoinRequest,
	rejectJoinRequest,
	removeGroupMember,
	promoteToGroupAdmin,
	demoteGroupAdmin,
	deleteGroupPost,
	getGroupStats,
};
