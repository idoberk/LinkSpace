const multer = require('multer');
const { createError } = require('../utils/errorUtils');

const storage = multer.memoryStorage();

const upload = multer({
	storage: storage,
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB limit
		files: 5, // 5 files per request
	},
	fileFilter: (req, file, cb) => {
		const allowedFileTypes = /jpeg|jpg|png|mp4/;
		const extensionName = allowedFileTypes.test(
			file.originalname.toLowerCase(),
		);
		const mimeType = allowedFileTypes.test(file.mimetype);

		if (mimeType && extensionName) {
			return cb(null, true);
		}

		cb(
			createError(
				'Invalid file type. Only images and videos are allowed.',
				400,
			),
		);
	},
});

module.exports = {
	uploadSingle: upload.single('file'),
	uploadMultiple: upload.array('files', 5),
};
