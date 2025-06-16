const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return res.status(401).json({ error: 'No token provided' });
		}

		const token = authHeader.substring(7); // remove the Bearer prefix
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId).select('-password');

		if (!user) {
			return res.status(401).json({ error: 'User not found' });
		}

		req.user = {
			userId: decoded.userId,
			user,
		};

		next();
	} catch (error) {
		if (error.name === 'JsonWebTokenError') {
			return res.status(401).json({ error: 'Invalid token' });
		}
		if (error.name === 'TokenExpiredError') {
			return res.status(401).json({ error: 'Token expired' });
		}
		res.status(500).json({ error: 'Authentication error' });
	}
};

const optionalAuth = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;

		if (authHeader && authHeader.startsWith('Bearer ')) {
			const token = authHeader.substring(7); // remove the Bearer prefix
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			const user = await User.findById(decoded.userId).select(
				'-password',
			);

			if (user) {
				req.user = {
					userId: decoded.userId,
					user,
				};
			}
		}

		next();
	} catch (error) {
		next();
	}
};

module.exports = { authenticate, optionalAuth };
