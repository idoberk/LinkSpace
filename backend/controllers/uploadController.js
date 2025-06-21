const {
	getTransformationOptions,
	processSingleFile,
	processMultipleFiles,
} = require('../services/mediaService');
const { handleErrors } = require('../middleware/errorHandler');
const { createError } = require('../utils/errorUtils');

const uploadSingleFile = async (req, res) => {
	try {
		if (!req.file) {
			throw createError('No file uploaded', 400);
		}

		const { folder, type = 'default' } = req.body;

		const uploadOptions = {
			folder: folder || 'linkspace/general',
			transformation: getTransformationOptions(type),
		};

		const mediaData = await processSingleFile(
			req.file.buffer,
			uploadOptions,
		);

		res.status(201).json({
			message: 'File uploaded successfully',
			media: mediaData,
		});
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

const uploadMultipleFiles = async (req, res) => {
	try {
		if (!req.files || req.files.length === 0) {
			throw createError('No files uploaded', 400);
		}

		const { folder } = req.body;

		const uploadOptions = {
			folder: folder || 'linkspace/posts',
			transformation: getTransformationOptions('post'),
		};

		const mediaDataArray = await processMultipleFiles(
			req.files,
			uploadOptions,
		);

		res.status(201).json({
			message: 'Files uploaded successfully',
			media: mediaDataArray,
		});
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

module.exports = {
	uploadSingleFile,
	uploadMultipleFiles,
};
