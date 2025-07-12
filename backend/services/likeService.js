const { createError } = require('../utils/errorUtils');

const toggleLike = async (Model, documentId, userId, options = {}) => {
	const { deletedField = 'isDeleted', statsField = 'stats.totalLikes' } =
		options;

	const document = await Model.findById(documentId);

	if (!document) {
		throw createError(`${Model.modelName} not found`, 404);
	}

	if (deletedField && document[deletedField]) {
		throw createError(
			`Cannot like a deleted ${Model.modelName.toLowerCase()}`,
			400,
		);
	}

	const isLiked = document.likes.some(
		(likeId) => likeId.toString() === userId,
	);

	let action;

	if (isLiked) {
		document.likes = document.likes.filter(
			(likeId) => likeId.toString() !== userId,
		);

		action = 'unliked';
	} else {
		document.likes.push(userId);
		action = 'liked';
	}

	if (statsField && document.stats) {
		const keys = statsField.split('.');
		if (keys.length === 2) {
			document.stats[keys[1]] = document.likes.length;
		}
	}

	await document.save();

	return {
		action,
		likeCount: document.likes.length,
		isLiked: action === 'liked',
	};
};

module.exports = { toggleLike };
