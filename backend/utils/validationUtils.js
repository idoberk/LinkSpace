const { createError } = require('./errorUtils');

const validationUtilsFactory = (Model, options = {}) => {
	const {
		notFoundMessage = `${Model.modelName || 'Item'} not found`,
		unauthorizedMessage = 'You do not have permission to access this item',
		authorField = 'author',
		deletedField = 'isDeleted',
		editableField = 'canEdit',
		editTimeField = 'TIME_ALLOWED_TO_EDIT',
		customChecks = {},
	} = options;

	const itemExists = async (itemId, session = null) => {
		const item = await Model.findById(itemId).session(session);

		if (!item) {
			throw createError(notFoundMessage, 404);
		}

		return item;
	};

	const isItemAuthor = (item, userId) => {
		const authorId = item[authorField];
		if (!authorId) {
			throw createError(
				`${Model.modelName} does not have an ${authorField} field`,
				500,
			);
		}

		if (authorId.toString() !== userId.toString()) {
			throw createError(unauthorizedMessage, 403);
		}

		return true;
	};

	const isItemNotDeleted = (item) => {
		if (deletedField && item[deletedField]) {
			throw createError(
				`Cannot access a deleted ${Model.modelName.toLowerCase()}`,
				400,
			);
		}

		return true;
	};

	const isItemEditable = (item, customMessage = null) => {
		if (editableField && typeof item[editableField] !== 'undefined') {
			if (!item[editableField]) {
				const message =
					customMessage ||
					`${Model.modelName} can no longer be edited`;
				throw createError(message, 400);
			}
		}
		return true;
	};

	const hasRolePermissions = (item, userId, roleField, roleName) => {
		const roles = item[roleField];

		if (!roles) {
			throw createError(
				`${Model.modelName} does not have ${roleField} field`,
				500,
			);
		}

		const hasPermission = Array.isArray(roles)
			? roles.some((id) => id.toString() === userId.toString())
			: roles.toString() === userId.toString();

		if (!hasPermission) {
			throw createError(`Only ${roleName} can perform this action`, 403);
		}

		return true;
	};

	const isMember = (item, userId, memberField = 'members', options = {}) => {
		const {
			statusField = 'status',
			requiredStatus = 'approved',
			checkStatus = true,
		} = options;

		const members = item[memberField];

		if (!members) {
			throw createError(
				`${Model.modelName} does not have ${memberField} field`,
				500,
			);
		}

		let isMember = false;

		if (Array.isArray(members)) {
			if (
				checkStatus &&
				members.length > 0 &&
				typeof members[0] === 'object'
			) {
				isMember = members.some(
					(m) =>
						m.user &&
						m.user.toString() === userId.toString() &&
						(!checkStatus || m[statusField] === requiredStatus),
				);
			} else {
				isMember = members.some(
					(id) => id.toString() === userId.toString(),
				);
			}
		}

		if (!isMember) {
			throw createError(
				`You must be an ${
					requiredStatus ? requiredStatus + ' ' : ''
				}member to perform this action`,
				403,
			);
		}

		return true;
	};

	const isNotBanned = (item, userId, banField = 'banList') => {
		const banList = item[banField];

		if (banList && Array.isArray(banList)) {
			const isBanned = banList.some((ban) => {
				const bannedUserId = ban.user || ban;
				return bannedUserId.toString() === userId.toString();
			});

			if (isBanned) {
				throw createError('You are banned from this resource', 403);
			}
		}

		return true;
	};

	const validateAccess = async (
		itemId,
		userId,
		checks = {},
		session = null,
	) => {
		const item = await itemExists(itemId, session);

		if (checks.requireAuthor) {
			isItemAuthor(item, userId);
		}

		if (checks.requireNotDeleted) {
			isItemNotDeleted(item);
		}

		if (checks.requireEditable) {
			isItemEditable(item, checks.editableMessage);
		}

		if (checks.requireRole) {
			hasRolePermissions(
				item,
				userId,
				checks.roleField || 'admins',
				checks.roleName || 'admin',
			);
		}

		if (checks.requireMember) {
			isMember(item, userId, checks.memberField, checks.memberOptions);
		}

		if (checks.requireNotBanned) {
			isNotBanned(item, userId, checks.banField);
		}

		// Run any custom checks
		if (checks.custom && Array.isArray(checks.custom)) {
			for (const customCheck of checks.custom) {
				await customCheck(item, userId);
			}
		}

		return item;
	};

	return {
		itemExists,
		isItemAuthor,
		isItemNotDeleted,
		isItemEditable,
		hasRolePermissions,
		isMember,
		isNotBanned,
		validateAccess,
		...customChecks,
	};
};

module.exports = validationUtilsFactory;
