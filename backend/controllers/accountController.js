const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Group = require('../models/Group');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { handleUserGroupDeletion } = require('../services/groupService');
const { handleErrors } = require('../middleware/errorHandler');
const { createError } = require('../utils/errorUtils');

// Operations users can do with their own account (login, register, update, delete, get own profile, etc...)

const generateToken = (userId) => {
	return jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE || '7d',
	});
};

const register = async (req, res) => {
	try {
		const { email, password, firstName, lastName } = req.body;
		// Check for existing user first
		const existingUser = await User.findOne({ email });

		if (existingUser) {
			const error = new Error('Duplicate key error');
			error.code = 11000;
			error.keyPattern = { email: 1 };
			throw error;
		}

		const user = new User({
			email,
			password,
			profile: {
				firstName,
				lastName,
			},
		});

		await user.save();

		const token = generateToken(user._id);
		const userResponse = user.toObject();

		delete userResponse.password;

		res.status(201).json({
			message: 'User registered successfully',
			token,
			user: userResponse,
		});
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email) {
			throw createError('Please provide an Email', 401);
		}

		const user = await User.findOne({ email });

		if (!user) {
			throw createError('Email is incorrect', 401);
		}

		const isPasswordValid = await user.comparePassword(password);

		if (!isPasswordValid) {
			throw createError('Password is incorrect', 401);
		}

		user.status.isOnline = true;
		user.status.lastSeen = new Date();
		await user.save();

		const token = generateToken(user._id);
		const userResponse = user.toObject();

		delete userResponse.password;

		res.json({
			message: 'Login successful',
			token,
			user: userResponse,
		});
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

const logout = async (req, res) => {
	try {
		const user = await User.findById(req.user.userId);

		if (user) {
			user.status.isOnline = false;
			user.status.lastSeen = new Date();

			await user.save();
		}

		res.json({ message: 'Logged out successfully' });
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

const deleteUser = async (req, res) => {
	try {
		// Verify password before deletion -- OPTIONAL
		const { password } = req.body;
		const userId = req.user.userId;
		const user = await User.findById(userId);

		if (!user) {
			throw createError('User not found', 404);
		}

		const isPasswordValid = await user.comparePassword(password);

		if (!isPasswordValid) {
			throw createError('Invalid password', 401);
		}

		// Start a database transaction ---> https://mongoosejs.com/docs/transactions.html
		const session = await mongoose.startSession();

		session.startTransaction();

		try {
			await handleUserGroupDeletion(userId, session);
			// Remove user from all friends' list
			await User.updateMany(
				{ friends: userId },
				{
					$pull: { friends: userId },
					$inc: { 'stats.totalFriends': -1 },
				},
				{ session },
			);

			// Remove user from all friend requests
			await User.updateMany(
				{},
				{
					$pull: {
						'friendRequests.sent': { user: userId },
						'friendRequests.received': { user: userId },
					},
				},
				{ session },
			);

			// Remove user from all posts' likes
			await Post.updateMany(
				{ likes: userId },
				{ $pull: { likes: userId } },
				{ session },
			);

			// Delete all comments made by the user
			await Comment.deleteMany({ author: userId }, { session });

			// Delete all posts made by the user
			await Post.deleteMany({ author: userId }, { session });

			// Delete the user
			await User.findByIdAndDelete(userId, { session });

			await session.commitTransaction();
			res.json({ message: 'Your account has been deleted successfully' });
		} catch (error) {
			await session.abortTransaction();
			throw error;
		} finally {
			session.endSession();
		}
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

const updateUser = async (req, res) => {
	try {
		const { password, currentPassword, profile, settings } = req.body;
		const userId = req.user.userId;
		const user = await User.findById(userId);

		if (!user) {
			throw createError('User not found', 404);
		}

		if (password) {
			if (!currentPassword) {
				throw createError(
					'Current password is required to change password',
					401,
				);
			}

			const isPasswordValid = await user.comparePassword(currentPassword);

			if (!isPasswordValid) {
				throw createError('Password is incorrect', 401);
			}

			user.password = password;
		}

		if (profile) {
			if (profile.firstName !== undefined) {
				user.profile.firstName = profile.firstName;
			}
			if (profile.lastName !== undefined) {
				user.profile.lastName = profile.lastName;
			}
			if (profile.birthDate !== undefined) {
				user.profile.birthDate = profile.birthDate;
			}
			if (profile.bio !== undefined) {
				user.profile.bio = profile.bio;
			}
			if (profile.address !== undefined) {
				user.profile.address = profile.address;
			}
			if (profile.avatar !== undefined) {
				user.profile.avatar = profile.avatar;
			}
			if (profile.coverImage !== undefined) {
				user.profile.coverImage = profile.coverImage;
			}
		}

		if (settings) {
			if (settings.privacy) {
				const validPrivacyValues = ['public', 'friends', 'private'];

				Object.keys(settings.privacy).forEach((key) => {
					if (
						user.settings.privacy[key] !== undefined &&
						validPrivacyValues.includes(settings.privacy[key])
					) {
						user.settings.privacy[key] = settings.privacy[key];
					}
				});
			}

			if (settings.notifications) {
				Object.keys(settings.notifications).forEach((key) => {
					if (user.settings.notifications[key] !== undefined) {
						user.settings.notifications[key] = Boolean(
							settings.notifications[key],
						);
					}
				});
			}
		}

		await user.save();

		const updatedUser = user.toObject();
		delete updatedUser.password;

		res.json({
			message: 'Profile updated successfully',
			user: updatedUser,
		});
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

const userProfile = async (req, res) => {
	try {
		const user = await User.findById(req.user.userId).select('-password');

		if (!user) {
			throw createError('User not found', 404);
		}

		res.json(user);
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

module.exports = {
	register,
	login,
	logout,
	deleteUser,
	updateUser,
	userProfile,
};
