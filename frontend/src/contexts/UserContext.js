import { createContext } from 'react';

export const UserContext = createContext({
	user: null,
	setUser: () => {},
	updateUser: () => {},
	logout: () => {},
});

// import { createContext } from 'react';

// export const UserContext = createContext({
// 	user: null,
// 	setUser: () => {},
// 	updateUser: () => {},
// 	logout: () => {},
// });
