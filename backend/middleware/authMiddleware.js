const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { handleErrors } = require('../middleware/errorHandler');
const { createError } = require('../utils/errorUtils');

const authenticate = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			throw createError('No token provided', 401);
		}

		const token = authHeader.substring(7); // remove the Bearer prefix
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId).select('-password');

		if (!user) {
			throw createError('User not found', 404);
		}

		req.user = {
			userId: decoded.userId,
			user,
		};

		next();
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

module.exports = authenticate;
