const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { authenticate } = require('../middleware/authMiddleware');
const {
	uploadSingle,
	uploadMultiple,
} = require('../middleware/uploadMiddleware');
const { handleUploadErrors } = require('../middleware/errorHandler');

router.post(
	'/single',
	authenticate,
	uploadSingle,
	handleUploadErrors,
	uploadController.uploadSingleFile,
);

router.post(
	'/multiple',
	authenticate,
	uploadMultiple,
	handleUploadErrors,
	uploadController.uploadMultipleFiles,
);

// router.delete('/publicId', authenticate, uploadController.deleteFile)

module.exports = router;
