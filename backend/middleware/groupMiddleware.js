const Group = require('../models/Group');
const createValidationMiddleware = require('./validationMiddleware');

const groupValidation = createValidationMiddleware(Group, {
	notFoundMessage: 'Group not found',
	itemName: 'group',
	authorField: 'creator',
});

const isGroupAdmin = groupValidation.checkRole('admins', 'group admin', 'id');
const isGroupCreator = groupValidation.checkAuthor('id');
const isGroupMember = groupValidation.validateAccess(
	{
		requireMember: true,
		memberField: 'members',
		memberOptions: {
			statusField: 'status',
			requiredStatus: 'approved',
			checkStatus: true,
		},
	},
	'id',
);

const canManageGroup = groupValidation.validateAccess(
	{
		requireRole: true,
		roleField: 'admins',
		roleName: 'group admin',
		requireNotBanned: true,
	},
	'id',
);

const isNotBanned = async (req, res, next) => {
	try {
		const group = req.group || (await Group.findById(req.params.id));
		const userId = req.user.userId;
		if (group && group.isUserBanned(userId)) {
			return res
				.status(403)
				.json({ error: 'You are banned from this group' });
		}
		next();
	} catch (error) {
		next(error);
	}
};

const isNotMember = async (req, res, next) => {
	try {
		const group = req.group || (await Group.findById(req.params.id));
		const userId = req.user.userId;
		if (
			group &&
			group.members.some(
				(m) => m.user.toString() === userId && m.status === 'approved',
			)
		) {
			return res
				.status(400)
				.json({ error: 'You are already a member of this group' });
		}
		next();
	} catch (error) {
		next(error);
	}
};

const isPendingMember = async (req, res, next) => {
	try {
		const group = req.group || (await Group.findById(req.params.id));
		const userId = req.user.userId;
		const pending =
			group &&
			group.members.find(
				(m) => m.user.toString() === userId && m.status === 'pending',
			);
		if (pending) {
			return res.status(400).json({
				error: 'You already have a pending request to join this group',
			});
		}
		next();
	} catch (error) {
		next(error);
	}
};

// Middleware to check if a target user is a group member (Unlike the other functions that check the user that sent the request)
const isTargetGroupMember = async (req, res, next) => {
	try {
		const group = req.group || (await Group.findById(req.params.id));
		const targetUserId = req.params.userId || req.body.userId;
		if (!targetUserId) {
			return res.status(400).json({ error: 'User ID is required' });
		}
		const isMember =
			group &&
			group.members.some(
				(m) =>
					m.user.toString() === targetUserId &&
					m.status === 'approved',
			);
		if (!isMember) {
			return res
				.status(404)
				.json({ error: 'User is not a member of this group' });
		}
		next();
	} catch (error) {
		next(error);
	}
};

module.exports = {
	isGroupMember,
	isGroupAdmin,
	isGroupCreator,
	canManageGroup,
	isNotBanned,
	isNotMember,
	isPendingMember,
	isTargetGroupMember,
};
