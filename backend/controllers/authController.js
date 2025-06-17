const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { handleErrors } = require('../middleware/errorHandler');

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
			// Use the actual field that caused the conflict
			error.keyPattern = {
				email: 1,
			};
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
			return res.status(400).json({
				error: 'Please provide an Email',
			});
		}

		const user = await User.findOne({ email });

		if (!user) {
			return res.status(401).json({
				error: 'Invalid credentials',
			});
		}

		const isPasswordValid = await user.comparePassword(password);

		if (!isPasswordValid) {
			return res.status(401).json({
				error: 'Invalid Password',
			});
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
		/* const { message, status } = handleErrors(error);
		res.status(status).json({ error: message }); */
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
		/* const errors = handleErrors(error);
		res.status(errors.status).json({ error: errors.message }); */
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

const deleteUser = async (req, res) => {
	try {
		// Verify password before deletion -- OPTIONAL
		const { password } = req.body;
		const user = await User.findById(req.user.userId);

		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		const isPasswordValid = await user.comparePassword(password);

		if (!isPasswordValid) {
			return res.status(401).json({
				error: 'Invalid Password',
			});
		}

		await User.findByIdAndDelete(req.user.userId);
		res.json({ message: 'Your account has been deleted successfully' });
	} catch (error) {
		/* const errors = handleErrors(error);
		res.status(errors.status).json({ error: errors.message }); */
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
			return res.status(404).json({ error: 'User not found' });
		}

		if (password) {
			if (!currentPassword) {
				return res.status(401).json({
					error: 'Current password is required to change password',
				});
			}

			const isPasswordValid = await user.comparePassword(currentPassword);

			if (!isPasswordValid) {
				return res.status(401).json({
					error: 'Password is incorrect',
				});
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
				user.profile.avatar = profile.address;
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
		/* const errors = handleErrors(error);
		res.status(errors.status).json({ error: errors.message }); */
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

const userProfile = async (req, res) => {
	try {
		const user = await User.findById(req.user.userId).select('-password');

		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		res.json(user);
	} catch (error) {
		/* const errors = handleErrors(error);
		res.status(errors.status).json({ error: errors.message }); */
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
