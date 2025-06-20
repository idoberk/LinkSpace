const cloudinary = require('../config/cloudinary');
const { createError } = require('../utils/errorUtils');

const uploadToCloudinary = (fileBuffer, options = {}) => {
	return new Promise((resolve, reject) => {
		cloudinary.uploader
			.upload_stream(
				{
					folder: options.folder || 'linkspace',
					resource_type: 'auto',
					transformation: [
						{
							width: 1000,
							height: 1000,
							crop: 'limit',
							quality: 'auto',
						},
					],
					...options,
				},
				(error, result) => {
					if (error) {
						reject(
							createError(
								'Failed to upload file to cloud storage',
								500,
							),
						);
					} else {
						resolve({
							url: result.secure_url,
							publicId: result.public_id,
							resourceType: result.resource_type,
							format: result.format,
							width: result.width,
							height: result.height,
							bytes: result.bytes,
						});
					}
				},
			)
			.end(fileBuffer);
	});
};

const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
	try {
		return await cloudinary.uploader.destroy(publicId, {
			resource_type: resourceType,
		});
	} catch (error) {
		throw createError('Failed to delete file from cloud storage', 500);
	}
};
module.exports = {
	uploadToCloudinary,
	deleteFromCloudinary,
};
