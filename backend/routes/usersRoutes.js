const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');

router.get('/', userController.getAllUsers);
router.get('/search', optionalAuth, userController.searchUser);
router.get('/:id', optionalAuth, userController.getUserById);

/*
// UPDATE USER
router.put('/:id', async (req, res) => {
	try {
		const { email, password } = req.body;
		const updateData = {};

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
 */
module.exports = router;
