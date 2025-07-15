export const calcPasswordStrength = (password) => {
	let strength = 0;

	if (password.length >= 8) strength += 1;

	if (password.length >= 12) strength += 1;

	if (/[a-z]/.test(password)) strength += 1;

	if (/[A-Z]/.test(password)) strength += 1;

	if (/[0-9]/.test(password)) strength += 1;

	if (/[^a-zA-Z0-9]/.test(password)) strength += 1;

	let level = 'Weak';
	if (strength >= 5) level = 'Strong';
	else if (strength >= 3) level = 'Medium';

	return {
		score: strength,
		level,
		percentage: (strength / 6) * 100,
	};
};
