const multer = require('multer');
const { createError } = require('../utils/errorUtils');
const { MAX_FILE_SIZE, MAX_FILE_UPLOADS } = require('../utils/constants');

const storage = multer.memoryStorage();
const upload = multer({
	storage: storage,
	limits: {
		fileSize: MAX_FILE_SIZE, // 10MB limit
		files: MAX_FILE_UPLOADS, // 5 files per request
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
	uploadSingle: (fieldName = 'file') => upload.single(fieldName),
	uploadMultiple: (fieldName = 'files', maxCount = MAX_FILE_UPLOADS) =>
		upload.array(fieldName, maxCount),
};

/* module.exports = {
	uploadSingle: upload.single('file'),
	uploadMultiple: upload.array('files', MAX_FILE_UPLOADS),
}; */
