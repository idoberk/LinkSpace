const {
	uploadToCloudinary,
	deleteFromCloudinary,
} = require('../services/mediaService');
const { handleErrors } = require('../middleware/errorHandler');
const { createError } = require('../utils/errorUtils');

const uploadSingleFile = async (req, res) => {
	try {
		if (!req.file) {
			throw createError('No file uploaded', 400);
		}

		const { folder } = req.body;

		let transformation = [
			{ width: 1000, height: 1000, crop: 'limit', quality: 'auto' },
		];

		if (folder === 'linkspace/avatars') {
			transformation = [
				{ width: 300, height: 300, crop: 'fill', gravity: 'face' },
			];
		} else if (folder === 'linkspace/covers') {
			transformation = [{ width: 1200, height: 400, crop: 'fill' }];
		}

		const uploadResult = await uploadToCloudinary(req.file.buffer, {
			folder: folder || 'linkspace/general',
			transformation,
		});

		const mediaData = {
			type: uploadResult.resourceType === 'video' ? 'video' : 'image',
			url: uploadResult.url,
			publicId: uploadResult.publicId,
			format: uploadResult.format,
			width: uploadResult.width,
			height: uploadResult.height,
			bytes: uploadResult.bytes,
		};

		res.json(201).json({
			message: 'File uploaded successfully',
		});
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

const uploadMultipleFiles = async (req, res) => {
	try {
		if (!req.file || req.files.length === 0) {
			throw createError('No files uploaded', 400);
		}

		const uploadFiles = req.files.map((file) =>
			uploadToCloudinary(file.buffer, {
				folder: `linkspace/posts`,
			}),
		);

		const uploadResults = await Promise.all(uploadFiles);

		const mediaDataArray = uploadResults.map((media) => ({
			type: media.resourceType === 'video' ? 'video' : 'image',
			url: media.url,
			publicId: media.publicId,
			format: media.format,
			width: media.width,
			height: media.height,
			bytes: media.bytes,
			// thumbnail:
		}));

		res.json(201).json({
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
