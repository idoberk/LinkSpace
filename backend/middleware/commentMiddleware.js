const Comment = require('../models/Comment');
const { handleErrors } = require('./errorHandler');
const { createError } = require('../utils/errorUtils');
const { TIME_ALLOWED_TO_EDIT } = require('../utils/constants');
const { convertMsToMinutes } = require('../utils/timeFormatting');

const canEditComment = async (req, res, next) => {
	try {
		const commentId = req.params.id;
		const userId = req.user.userId;
		const comment = await Comment.findById(commentId);

		if (!comment) {
			throw createError('Comment not found', 404);
		}

		if (comment.author.toString() !== userId) {
			throw createError('You can only edit your own comments', 403);
		}

		if (comment.isDeleted) {
			throw createError('Cannot edit a deleted comment', 400);
		}

		if (!comment.canEdit) {
			throw createError(
				`Comment can no longer be edited (${convertMsToMinutes(
					TIME_ALLOWED_TO_EDIT,
				)} minutes limit exceeded)`,
				400,
			);
		}

		req.comment = comment;
		next();
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

const canDeleteComment = async (req, res, next) => {
	try {
		const commentId = req.params.id;
		const userId = req.user.userId;
		const comment = await Comment.findById(commentId);

		if (!comment) {
			throw createError('Comment not found', 404);
		}

		if (comment.author.toString() !== userId) {
			throw createError('You can only delete your own comments', 403);
		}

		if (comment.isDeleted) {
			throw createError('Comment is already deleted', 400);
		}

		req.comment = comment;
		next();
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status).json({ errors });
	}
};

module.exports = { canEditComment, canDeleteComment };
