import validator from 'validator';

export const isEmail = (value) => {
	return validator.isEmail(value);
};

export const hasMinLength = (value, minLen) => {
	return value.length >= minLen;
};

export const hasMaxLength = (value, maxLen) => {
	return value.length <= maxLen;
};

export const isNotEmpty = (value) => {
	return value.trim().length > 0;
};

export const isAlpha = (value) => {
	return validator.isAlpha(value);
};

export const isValidName = (value, minLen, maxLen) => {
	return (
		isNotEmpty(value) &&
		isAlpha(value) &&
		hasMinLength(value, minLen) &&
		hasMaxLength(value, maxLen)
	);
};
