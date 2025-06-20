const handleErrors = (error) => {
	const errors = {};

	// Duplicate Key Error (MongoDB)
	if (error.code === 11000) {
		const field = Object.keys(error.keyPattern)[0];
		errors[field] = `${field} is already in use`;
		errors.status = 409;
		return errors;
	}

	// Validation Errors
	if (error.name === 'ValidationError') {
		Object.values(error.errors).forEach(({ properties }) => {
			errors[properties.path] = properties.message;
		});
		errors.status = 400;
	}

	// JWT Errors
	if (error.name === 'JsonWebTokenError') {
		errors.message = 'Invalid token';
		errors.status = 401;
	}

	if (error.name === 'TokenExpiredError') {
		errors.message = 'Token has expired';
		errors.status = 401;
	}

	// Custom Error Messages
	if (error.message && !error.errors) {
		errors.message = error.message;
		errors.status = error.status || 500;
	}

	return errors;
};

const handleUploadErrors = (error, req, res, next) => {
	const errors = {};

	if (error.code === 'LIMIT_FILE_SIZE') {
		errors.message = 'File too large. Maximum size is 10MB.';
		errors.status = 400;
	} else if (error.code === 'LIMIT_FILE_COUNT') {
		errors.message = 'Too many files. Maximum is 5 files.';
		errors.status = 400;
	} else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
		errors.message = 'Unexpected field name for file upload.';
		errors.status = 400;
	} else {
		return handleErrors(error);
	}

	return errors;
};

module.exports = {
	handleErrors,
	handleUploadErrors,
};
