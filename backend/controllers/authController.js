const jwt = require('jsonwebtoken');
const User = require('../models/User');

const handleErrors = (error) => {
	const errors = {};

	// Duplicate Key Error (MongoDB)
	if (error.code === 11000) {
		const field = Object.keys(error.keyPattern)[0];
		errors[field] = `${field} is already in use`;
		errors.status = 409;

		return errors;
	}

	// Validation Errors
	if (error.name === 'ValidationError') {
		Object.values(error.errors).forEach(({ properties }) => {
			errors[properties.path] = properties.message;
		});
		errors.status = 400;
	}

	// JWT Errors
	if (error.name === 'JsonWebTokenError') {
		errors.message = 'Invalid token';
		errors.status = 401;
	}

	if (error.name === 'TokenExpiredError') {
		errors.message = 'Token has expired';
		errors.status = 401;
	}

	// Custom Error Messages
	if (error.message && !error.errors) {
		errors.message = error.message;
	}

	return errors;
};

const generateToken = (userId) => {
	return jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE || '7d',
	});
};

const register = async (req, res) => {
	const { email, password, firstName, lastName } = req.body;

	try {
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
	const { email, password } = req.body;

	try {
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
		const { message, status } = handleErrors(error);
		res.status(status).json({ error: message });
	}
};

const logout = async (req, res) => {
	const user = await User.findById(req.user.userId);

	try {
		if (user) {
			user.status.isOnline = false;
			user.status.lastSeen = new Date();

			await user.save();
		}

		res.json({ message: 'Logged out successfully' });
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ error: errors.message });
	}
};

const userProfile = async (req, res) => {
	const user = await User.findById(req.user.userId).select('-password');

	try {
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		res.json(user);
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ error: errors.message });
	}
};

module.exports = { register, login, logout, userProfile };
