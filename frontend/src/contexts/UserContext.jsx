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
