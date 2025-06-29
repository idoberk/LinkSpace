import validator from 'validator';

export const isEmail = (value) => {
	return validator.isEmail(value);
};

export const hasMinLength = (value, minLen) => {
	return value.length >= minLen;
};
