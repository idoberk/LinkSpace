const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/register', accountController.register);
router.post('/login', accountController.login);

router.post('/logout', authenticate, accountController.logout);
router.get('/profile', authenticate, accountController.userProfile);

router.put('/profile', authenticate, accountController.updateUser);

router.delete('/', authenticate, accountController.deleteUser);

module.exports = router;
