const cloudinary = require('../config/cloudinary');
const { createError } = require('../utils/errorUtils');

/**
 * Uploads a file buffer to Cloudinary.
 * @param {Buffer} fileBuffer - The file buffer
 * @param {Object} options - Upload options (folder, resource_type, transformation, etc.)
 * @returns {Promise<Object>} - The upload result
 */
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

/**
 * Deletes a file from Cloudinary by publicId.
 * @param {string} publicId - The Cloudinary public ID
 * @param {string} [resourceType='image'] - The resource type (image, video, etc.)
 * @returns {Promise<Object>} - The delete result
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
	try {
		return await cloudinary.uploader.destroy(publicId, {
			resource_type: resourceType,
		});
	} catch (error) {
		throw createError('Failed to delete file from cloud storage', 500);
	}
};

/**
 * Formats Cloudinary upload result into a media object for DB storage.
 * @param {Object} uploadResult - The Cloudinary upload result
 * @returns {Object} - The formatted media object
 */
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

/**
 * Returns transformation options for different upload types.
 * @param {string} uploadType - The type of upload (avatar, cover, post, etc.)
 * @returns {Array<Object>} - The transformation options
 */
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

/**
 * Processes a single file buffer and uploads to Cloudinary.
 * @param {Buffer} fileBuffer - The file buffer
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - The formatted media object
 */
const processSingleFile = async (fileBuffer, options = {}) => {
	try {
		const uploadResult = await uploadToCloudinary(fileBuffer, options);
		return formatMediaData(uploadResult);
	} catch (error) {
		throw createError('Failed to process file', 500);
	}
};

/**
 * Processes multiple files and uploads to Cloudinary.
 * @param {Array<{buffer: Buffer}>} files - Array of file objects with buffer
 * @param {Object} options - Upload options
 * @returns {Promise<Array<Object>>} - Array of formatted media objects
 */
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

/**
 * Deletes an array of media files from Cloudinary.
 * @param {Array<Object>} mediaArray - Array of media objects with publicId/type
 * @returns {Promise<void>}
 */
const deleteMediaFiles = async (mediaArray) => {
	if (!mediaArray || mediaArray.length === 0) return;

	const deleteFiles = mediaArray.map((media) => {
		const publicId = media.publicId;
		const resourceType = media.type || 'image';

		if (publicId) {
			return deleteFromCloudinary(publicId, resourceType);
		}
	});

	try {
		await Promise.all(deleteFiles);
	} catch (error) {
		console.error('Error deleting media files:', error);
		// Don't throw here, as this is often called during cleanup
	}
};

/**
 * Cleans up successfully uploaded files if a batch upload fails.
 * @param {Array<Object>} uploadResults - Array of upload results
 * @returns {Promise<void>}
 */
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
