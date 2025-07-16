import { io } from 'socket.io-client';
import { getToken } from '../utils/auth';

export function createSocket() {
	const token = getToken();
	return io('http://localhost:5000', {
		withCredentials: true,
		auth: { token },
	});
}

// Default socket instance (not recommended for dynamic auth)
const socket = createSocket();
export default socket;
