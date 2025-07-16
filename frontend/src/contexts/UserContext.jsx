import React, { useState, useCallback, useEffect } from 'react';
import {
	getUser,
	setUser as setUserInStorage,
	removeUser,
	removeToken,
} from '../utils/auth';
import { UserContext } from './UserContext.js';

export const UserProvider = ({ children }) => {
	const [user, setUserState] = useState(() => getUser());

	// Keep localStorage in sync when user changes
	const setUser = useCallback((newUser) => {
		setUserState(newUser);
		if (newUser) {
			setUserInStorage(newUser);
		} else {
			removeUser();
		}
	}, []);

	// Logout function clears user and token
	const logout = useCallback(() => {
		setUserState(null);
		removeUser();
		removeToken();
	}, []);

	// Sync with localStorage changes (e.g., in other tabs)
	useEffect(() => {
		const handleStorage = (e) => {
			if (e.key === 'user') {
				setUserState(getUser());
			}
		};
		window.addEventListener('storage', handleStorage);
		return () => window.removeEventListener('storage', handleStorage);
	}, []);

	return (
		<UserContext.Provider value={{ user, setUser, logout }}>
			{children}
		</UserContext.Provider>
	);
};

// import { useState, useEffect } from 'react';
// import { UserContext } from './UserContext.js';

// export const UserProvider = ({ children }) => {
// 	const [user, setUser] = useState(null);

// 	useEffect(() => {
// 		try {
// 			const userFromStorage = localStorage.getItem('user');
// 			if (userFromStorage) {
// 				setUser(JSON.parse(userFromStorage));
// 			}
// 		} catch (error) {
// 			console.error('Error loading user from localStorage:', error);
// 			localStorage.removeItem('user');
// 		}
// 	}, []);

// 	const updateUser = (newUserData) => {
// 		try {
// 			console.log('Updating user with:', newUserData);
// 			setUser(newUserData);
// 			localStorage.setItem('user', JSON.stringify(newUserData));
// 		} catch (error) {
// 			console.error('Error updating user:', error);
// 		}
// 	};

// 	const logout = () => {
// 		try {
// 			setUser(null);
// 			localStorage.removeItem('user');
// 		} catch (error) {
// 			console.error('Error during logout:', error);
// 		}
// 	};

// 	return (
// 		<UserContext.Provider value={{ user, setUser, updateUser, logout }}>
// 			{children}
// 		</UserContext.Provider>
// 	);
// };
