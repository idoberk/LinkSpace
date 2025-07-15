// Get token from localStorage
export const getToken = () => localStorage.getItem('token');

// Set token in localStorage
export const setToken = (token) => localStorage.setItem('token', token);

// Remove token from localStorage
export const removeToken = () => localStorage.removeItem('token');

// Decode JWT payload
export const getTokenPayload = () => {
	const token = getToken();
	if (!token) return null;
	try {
		const payload = JSON.parse(atob(token.split('.')[1]));
		return payload;
	} catch {
		return null;
	}
};

// Check if token is expired
export const isTokenExpired = () => {
	const payload = getTokenPayload();
	if (!payload || !payload.exp) return true;
	// exp is in seconds, Date.now() is in ms
	return Date.now() >= payload.exp * 1000;
};

// Check if user is authenticated (token exists and is not expired)
export const isAuthenticated = () => {
	const token = getToken();
	if (!token) return false;
	return !isTokenExpired();
};

// Get user object from localStorage
export const getUser = () => {
	const storedUser = localStorage.getItem('user');
	return storedUser ? JSON.parse(storedUser) : null;
};

// Remove user object from localStorage
export const removeUser = () => localStorage.removeItem('user');

// Set user object in localStorage
export const setUser = (user) =>
	localStorage.setItem('user', JSON.stringify(user));
