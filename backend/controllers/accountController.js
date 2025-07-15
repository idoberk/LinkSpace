const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { handleUserGroupDeletion } = require('../services/groupService');
const { handleErrors } = require('../middleware/errorHandler');
const { createError } = require('../utils/errorUtils');
const {
	findUserByEmailOrThrow,
	findUserByIdOrThrow,
	validateUserPasswordOrThrow,
} = require('../utils/userValidation');
const {
	processSingleFile,
	getTransformationOptions,
	deleteFromCloudinary,
} = require('../services/mediaService');
const { parseFormData } = require('../utils/parseFormData');
const { deleteMessagesByUser } = require('../services/messageService');
const {
	deleteConversationsByUser,
} = require('../services/conversationService');
const {
	deletePostsByUser,
	removeUserFromPostLikes,
} = require('../services/postService');
const { deleteCommentsByUser } = require('../services/commentService');
const {
	removeUserFromFriends,
	removeUserFromFriendRequests,
} = require('../services/userService');

// Operations users can do with their own account (login, register, update, delete, get own profile, etc...)

const generateToken = (userId) => {
	return jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE || '7d',
	});
};

const register = async (req, res) => {
	try {
		const { email, password, firstName, lastName } = req.body;
		const existingUser = await User.findOne({ email });

		if (existingUser) {
			throw createError('Email already in use', 409);
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

		const user = await findUserByEmailOrThrow(email);
		await validateUserPasswordOrThrow(user, password);

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
		const user = await findUserByIdOrThrow(userId);

		await validateUserPasswordOrThrow(user, password);

		// Delete avatar from Cloudinary if it exists
		if (user.profile.avatar && user.profile.avatar.publicId) {
			try {
				await deleteFromCloudinary(
					user.profile.avatar.publicId,
					'image',
				);
			} catch (err) {
				console.error('Failed to delete user avatar:', err);
			}
		}

		// Start a database transaction ---> https://mongoosejs.com/docs/transactions.html
		const session = await mongoose.startSession();

		session.startTransaction();

		try {
			await handleUserGroupDeletion(userId, session);

			// Remove user from all friends' list
			await removeUserFromFriends(userId, session);

			// Remove user from all friend requests
			await removeUserFromFriendRequests(userId, session);

			// Remove user from all posts' likes
			await removeUserFromPostLikes(userId, session);

			// Delete all messages sent by the user
			await deleteMessagesByUser(userId, session);

			// Delete all conversations where the user is a participant
			await deleteConversationsByUser(userId, session);

			// Delete all comments made by the user
			await deleteCommentsByUser(userId, session);

			// Delete all posts made by the user
			await deletePostsByUser(userId, session);

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
		const parsedFormData = parseFormData(req.body);
		const { password, currentPassword, profile, settings } = parsedFormData;
		const userId = req.user.userId;
		const user = await findUserByIdOrThrow(userId);

		// Handle password change
		if (password) {
			if (!currentPassword) {
				throw createError(
					'Current password is required to change password',
					401,
				);
			}
			await validateUserPasswordOrThrow(user, currentPassword);
			user.password = password;
		}

		if (req.file) {
			if (user.profile.avatar && user.profile.avatar.publicId) {
				try {
					await deleteFromCloudinary(
						user.profile.avatar.publicId,
						'image',
					);
				} catch (err) {
					console.error('Failed to delete old avatar:', err);
				}
			}

			const avatarMedia = await processSingleFile(req.file.buffer, {
				folder: `linkspace/users/${userId}/profile`,
				transformation: getTransformationOptions('avatar'),
			});

			user.profile.avatar = {
				url: avatarMedia.url,
				publicId: avatarMedia.publicId,
			};
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

		const userObj = user.toObject();

		if (userObj.settings?.privacy?.showOnlineStatus === 'private') {
			if (userObj.status) {
				userObj.status.isOnline = null;
				userObj.status.isActive = null;
				userObj.status.lastSeen = null;
			}
		}

		res.json(userObj);
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
