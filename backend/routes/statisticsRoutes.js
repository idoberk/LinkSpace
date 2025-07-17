const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');

// Get user statistics
router.get('/users', statisticsController.getUserStatistics);

module.exports = router; 