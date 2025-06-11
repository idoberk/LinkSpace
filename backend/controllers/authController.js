const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) => {
	return jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE || '7d',
	});
};

const register = async (req, res) => {
	try {
		const { username, email, password } = req.body;

		const existingUser = await User.findOne({
			$or: [{ email }, { username }],
		});

		if (existingUser) {
			return res.status(409).json({
				error:
					existingUser.email === email
						? 'Email already in use'
						: 'Username already taken',
			});
		}

		const user = new User({
			username,
			email,
			password,
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
		if (error.name === 'ValidationError') {
			const errors = Object.values(error.errors).map(
				(err) => err.message,
			);

			return res.status(400).json({ errors });
		}
		res.status(500).json({
			error: 'An error occurred while trying to register user',
		});
	}
};
const login = async (req, res) => {
	try {
		const { username, email, password } = req.body;

		if (!username && !email) {
			return res.status(400).json({
				error: 'Please provide username or email',
			});
		}

		const user = await User.findOne({
			$or: [
				{ username: username || undefined },
				{ email: email || undefined },
			].filter(Boolean),
		});

		if (!user) {
			return res.status(401).json({
				error: 'Invalid credentials',
			});
		}

		const isPasswordValid = await user.comparePassword(password);

		if (!isPasswordValid) {
			return res.status(401).json({
				error: 'Invalid credentials',
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
		res.status(500).json({
			error: 'An error occurred while trying to login',
		});
	}
};

module.exports = { register, login };
