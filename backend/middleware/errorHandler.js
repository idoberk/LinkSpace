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
		errors.status = 500;
	}

	return errors;
};

module.exports = {
	handleErrors,
};
