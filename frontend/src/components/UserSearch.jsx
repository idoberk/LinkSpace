'use client';

import { useState } from 'react';
import api from '../lib/axios';
import UserCard from './UserCard';

const UserSearch = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(false);

	const searchUsers = async () => {
		if (!searchTerm.trim()) return;

		setLoading(true);
		try {
			const response = await api.get(`/api/users/search?q=${searchTerm}`);
			setUsers(response.data);
		} catch (error) {
			console.error('Error searching users:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleSendFriendRequest = async (userId) => {
		try {
			await api.post(`/api/users/${userId}/friend-request`);
			// Update the user in the list to show request sent
			setUsers(
				users.map((user) =>
					user._id === userId
						? { ...user, friendRequestSent: true }
						: user,
				),
			);
		} catch (error) {
			console.error('Error sending friend request:', error);
		}
	};

	return (
		<div className='max-w-2xl mx-auto p-4'>
			<div className='mb-6'>
				<div className='flex gap-2'>
					<input
						type='text'
						placeholder='Search users...'
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className='flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
						onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
					/>
					<button
						onClick={searchUsers}
						disabled={loading}
						className='bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md disabled:opacity-50'>
						{loading ? 'Searching...' : 'Search'}
					</button>
				</div>
			</div>

			<div>
				{users.map((user) => (
					<UserCard
						key={user._id}
						user={user}
						onSendFriendRequest={handleSendFriendRequest}
					/>
				))}
			</div>
		</div>
	);
};

export default UserSearch;
