const Group = require('../models/Group');
const { handleErrors } = require('../middleware/errorHandler');
const { createError } = require('../utils/errorUtils');

const isGroupMember = async (req, res, next) => {
	try {
		const groupId = req.params.id;
		const userId = req.user.userId;
		const group = await Group.findById(groupId);

		if (!group) {
			throw createError('Group not found', 404);
		}

		const member = group.members.find(
			(m) => m.user.toString() === userId && m.status === 'approved',
		);

		if (!member) {
			throw createError('You must be a member of this group', 403);
		}

		req.group = group;
		next();
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

const isGroupAdmin = async (req, res, next) => {
	try {
		const groupId = req.params.id;
		const userId = req.user.userId;
		const group = await Group.findById(groupId);

		if (!group) {
			throw createError('Group not found', 404);
		}

		const isAdmin = group.admins.some(
			(admin) => admin.toString() === userId,
		);

		if (!isAdmin) {
			throw createError('Only group admins can perform this action', 403);
		}

		req.group = group;
		next();
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

const isGroupCreator = async (req, res, next) => {
	try {
		const groupId = req.params.id;
		const userId = req.user.userId;
		const group = await Group.findById(groupId);

		if (!group) {
			throw createError('Group not found', 404);
		}

		if (group.creator.toString() !== userId) {
			throw createError(
				'Only the group creator can perform this action',
				403,
			);
		}

		req.group = group;
		next();
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

/* const canViewGroup = async (req, res, next) => {
	try {
		const groupId = req.params.id;
		const userId = req.user?.userId;
		const group = await Group.findById(groupId)

		if (!group) {
			throw createError('Group not found', 404);
		}

		if (group.privacy === 'public') {
			req.group = group;
			return next();
		}

		if (!userId) {
			throw createError('')
		}
	}
}; */

module.exports = {
	isGroupMember,
	isGroupAdmin,
	isGroupCreator,
	//canViewGroup,
};
