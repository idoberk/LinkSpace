const { createError } = require('../utils/errorUtils');
const validationUtilsFactory = require('../utils/validationUtils');
const { handleErrors } = require('./errorHandler');

const createValidationMiddleware = (Model, options = {}) => {
	const validationUtils = validationUtilsFactory(Model, options);

	const validateAccess = (checks = {}, paramName = 'id') => {
		return async (req, res, next) => {
			try {
				const itemId = req.params[paramName];
				const userId = req.user?._id || req.user?.userId;

				if (
					!userId &&
					(checks.requireAuthor | checks.requireRole ||
						checks.requireMember)
				) {
					throw createError('Authentication required', 401);
				}

				const item = await validationUtils.validateAccess(
					itemId,
					userId,
					checks,
				);

				const itemName =
					options.itemName || Model.modelName.toLowerCase();
				req[itemName] = item;

				next();
			} catch (error) {
				const errors = handleErrors(error);
				res.status(errors.status || 500).json({ errors });
			}
		};
	};

	const checkExists = (paramName = 'id') => {
		return async (req, res, next) => {
			try {
				const itemId = req.params[paramName];
				const item = await validationUtils.itemExists(itemId);

				const itemName =
					options.itemName || Model.modelName.toLowerCase();
				req[itemName] = item;

				next();
			} catch (error) {
				const errors = handleErrors(error);
				res.status(errors.status || 500).json({ errors });
			}
		};
	};

	const checkAuthor = (paramName = 'id') => {
		return validateAccess({ requireAuthor: true }, paramName);
	};

	const checkRole = (roleField, roleName, paramName = 'id') => {
		return validateAccess(
			{
				requireRole: true,
				roleField,
				roleName,
			},
			paramName,
		);
	};

	const checkMember = (memberOptions = {}, paramName = 'id') => {
		return validateAccess(
			{
				requireMember: true,
				memberOptions,
			},
			paramName,
		);
	};

	const checkCanEdit = (paramName = 'id', customMessage = null) => {
		return validateAccess(
			{
				requireAuthor: true,
				requireNotDeleted: true,
				requireEditable: true,
				editableMessage: customMessage,
			},
			paramName,
		);
	};

	const checkCanDelete = (paramName = 'id') => {
		return validateAccess(
			{
				requireAuthor: true,
				requireNotDeleted: true,
			},
			paramName,
		);
	};

	const createCustom = (customChecks) => {
		return (paramName = 'id') => {
			return async (req, res, next) => {
				try {
					const itemId = req.params[paramName];
					const userId = req.user?.userId || req.user?._id;

					const item = await validationUtils.itemExists(itemId);

					await customChecks(item, userId, req);

					const itemName =
						options.itemName || Model.modelName.toLowerCase();
					req[itemName] = item;

					next();
				} catch (error) {
					const errors = handleErrors(error);
					res.status(errors.status || 500).json({ errors });
				}
			};
		};
	};

	return {
		validateAccess,
		checkExists,
		checkAuthor,
		checkRole,
		checkMember,
		checkCanEdit,
		checkCanDelete,
		createCustom,
		utils: validationUtils,
	};
};

module.exports = createValidationMiddleware;
