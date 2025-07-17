import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
	getUser,
	setUser as setUserInStorage,
	removeUser,
	removeToken,
} from '../utils/auth';
import { UserContext } from './UserContext.js';
import { createSocket } from '../lib/socket';

export const UserProvider = ({ children }) => {
	const [user, setUserState] = useState(() => {
		try {
			return getUser();
		} catch (error) {
			console.error('Error initializing user state:', error);
			return null;
		}
	});
	const [socket, setSocket] = useState(null); // <-- Add this
	const socketRef = useRef(null);

	// Keep localStorage in sync when user changes
	const setUser = useCallback((newUser) => {
		setUserState(newUser);
		if (newUser) {
			setUserInStorage(newUser);
		} else {
			removeUser();
		}
	}, []);

	// Update user function - alias for setUser for clarity
	const updateUser = useCallback((newUserData) => {
		console.log('Updating user with:', newUserData);
		setUser(newUserData);
	}, [setUser]);

	// Logout function clears user and token, and disconnects socket
	const logout = useCallback(() => {
		setUserState(null);
		removeUser();
		removeToken();
		if (socketRef.current) {
			socketRef.current.disconnect();
			socketRef.current = null;
			setSocket(null); // <-- update state
		}
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

	// Manage socket connection on login/logout
	useEffect(() => {
		if (user) {
			if (socketRef.current) {
				socketRef.current.disconnect();
			}
			const newSocket = createSocket();
			socketRef.current = newSocket;
			setSocket(newSocket); // <-- update state so context consumers re-render
		} else {
			if (socketRef.current) {
				socketRef.current.disconnect();
				socketRef.current = null;
			}
			setSocket(null); // <-- update state
		}
		return () => {
			if (socketRef.current) {
				socketRef.current.disconnect();
				socketRef.current = null;
			}
			setSocket(null); // <-- update state
		};
	}, [user]);

	return (
		<UserContext.Provider value={{ user, setUser, updateUser, logout, socket }}>
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
