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

const formatMediaData = (uploadResult) => {
	return {
		type: uploadResult.resourceType === 'video' ? 'video' : 'image',
		url: uploadResult.url,
		publicId: uploadResult.publicId,
		format: uploadResult.format,
		width: uploadResult.width,
		height: uploadResult.height,
		bytes: uploadResult.bytes,
		// Thumbnail?
	};
};

const getTransformationOptions = (uploadType) => {
	const transformations = {
		avatar: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }],
		cover: [{ width: 1200, height: 400, crop: 'fill' }],
		post: [{ width: 1000, height: 1000, crop: 'limit', quality: 'auto' }],
		default: [
			{ width: 1000, height: 1000, crop: 'limit', quality: 'auto' },
		],
	};

	return transformations[uploadType] || transformations.default;
};

const processSingleFile = async (fileBuffer, options = {}) => {
	try {
		const uploadResult = await uploadToCloudinary(fileBuffer, options);
		return formatMediaData(uploadResult);
	} catch (error) {
		throw createError('Failed to process file', 500);
	}
};

const processMultipleFiles = async (files, options = {}) => {
	if (!files || files.length === 0) {
		return [];
	}

	let uploadResults = [];

	try {
		const uploadFiles = files.map((file) =>
			uploadToCloudinary(file.buffer, options),
		);

		uploadResults = await Promise.all(uploadFiles);

		return uploadResults.map((result) => formatMediaData(result));
	} catch (error) {
		// If any upload fails, attempt to clean up successfully uploaded files
		await cleanupFailedUploads(uploadResults);
		throw createError('Failed to process files', 500);
	}
};

const deleteMediaFiles = async (mediaArray) => {
	if (!mediaArray || mediaArray.length === 0) return;

	const deleteFiles = mediaArray.map((media) =>
		deleteFromCloudinary(media.publicId, media.type),
	);

	try {
		await Promise.all(deleteFiles);
	} catch (error) {
		console.error('Error deleting media files:', error);
		// Don't throw here, as this is often called during cleanup
	}
};

const cleanupFailedUploads = async (uploadResults) => {
	const successfulUploads = uploadResults.filter(
		(result) => result && result.publicId,
	);

	if (successfulUploads.length > 0) {
		const mediaToDelete = successfulUploads.map((result) =>
			formatMediaData(result),
		);
		await deleteMediaFiles(mediaToDelete);
	}
};

module.exports = {
	uploadToCloudinary,
	deleteFromCloudinary,
	formatMediaData,
	getTransformationOptions,
	processSingleFile,
	processMultipleFiles,
	deleteMediaFiles,
	cleanupFailedUploads,
};
