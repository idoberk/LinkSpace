const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);

router.post('/logout', authenticate, authController.logout);
router.get('/profile', authenticate, authController.userProfile);

router.put('/profile', authenticate, authController.updateUser);

router.delete('/account', authenticate, authController.deleteUser);

module.exports = router;
