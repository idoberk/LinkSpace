const qs = require('qs');

const typeCoercingDecoder = (str, defaultDecoder, charset, type) => {
	if (str === 'true') return true;
	if (str === 'false') return false;
	if (!isNaN(str) && str.trim() !== '') return Number(str);
	return defaultDecoder(str);
};

const parseFormData = (body) => {
	return qs.parse(body, {
		allowDots: true,
		decoder: typeCoercingDecoder,
	});
};

module.exports = { parseFormData };
