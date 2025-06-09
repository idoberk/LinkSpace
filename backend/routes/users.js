const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET USER
router.get('/:id', async (req, res) => {
	try {
		const user = await User.findById(req.params.id).select('-password');

		if (!user) {
			return res.status(404).json({
				error: 'User was not found',
			});
		}

		res.json(user);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// ADD USER
router.post('/', async (req, res) => {
	try {
		const { username, email, password } = req.body;

		const user = new User({
			username,
			email,
			password,
		});

		await user.save();

		const userResponse = user.toObject();
		delete userResponse.password;

		res.status(201).json(userResponse);
	} catch (error) {
		if (error.name === 'ValidationError') {
			const errors = Object.values(error.errors).map(
				(err) => err.message,
			);
			return res.status(400).json({ errors });
		}

		// Handle duplicate key errors
		if (error.code === 11000) {
			const field = Object.keys(error.keyPattern)[0];
			return res.status(400).json({
				error: `${field} already exists`,
			});
		}

		res.status(500).json({ error: error.message });
	}
});

// UPDATE USER
router.put('/:id', async (req, res) => {
	try {
		const { username, email, password } = req.body;
		const updateData = {};

		if (username) updateData.username = username;
		if (email) updateData.email = email;
		if (password) updateData.password = password;

		const user = await User.findByIdAndUpdate(req.params.id, updateData, {
			new: true,
			runValidators: true,
		}).select('-password');

		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		res.json(user);
	} catch (error) {
		if (error.name === 'ValidationError') {
			const errors = Object.values(error.errors).map(
				(err) => err.message,
			);
			return res.status(400).json({ errors });
		}
		res.status(500).json({ error: error.message });
	}
});

// DELETE USER
router.delete('/:id', async (req, res) => {
	try {
		const user = await User.findByIdAndDelete(req.params.id);

		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		res.json({ message: 'User deleted successfully' });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;
