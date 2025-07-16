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
	const [user, setUserState] = useState(() => getUser());
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
		<UserContext.Provider value={{ user, setUser, logout, socket }}>
			{children}
		</UserContext.Provider>
	);
};
