const User = require('../models/User');
const { createError } = require('./errorUtils');

const findUserByEmailOrThrow = async (email) => {
	const user = await User.findOne({ email });
	if (!user) {
		throw createError('Email is incorrect', 401);
	}
	return user;
};

const findUserByIdOrThrow = async (userId) => {
	const user = await User.findById(userId);
	if (!user) {
		throw createError('User not found', 404);
	}
	return user;
};

const validateUserPasswordOrThrow = async (user, password) => {
	const isValid = await user.comparePassword(password);
	if (!isValid) {
		throw createError('Password is incorrect', 401);
	}
};

module.exports = {
	findUserByEmailOrThrow,
	findUserByIdOrThrow,
	validateUserPasswordOrThrow,
};
