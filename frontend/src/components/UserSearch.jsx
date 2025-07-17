// 'use client';

// import { useState } from 'react';
// import api from '../lib/axios';
// import UserCard from './UserCard';

// const UserSearch = () => {
// 	const [searchTerm, setSearchTerm] = useState('');
// 	const [users, setUsers] = useState([]);
// 	const [loading, setLoading] = useState(false);

// 	const searchUsers = async () => {
// 		if (!searchTerm.trim()) return;

// 		setLoading(true);
// 		try {
// 			const response = await api.get(`/api/users/search?q=${searchTerm}`);
// 			setUsers(response.data);
// 		} catch (error) {
// 			console.error('Error searching users:', error);
// 		} finally {
// 			setLoading(false);
// 		}
// 	};

// 	const handleSendFriendRequest = async (userId) => {
// 		try {
// 			await api.post(`/api/users/${userId}/friend-request`);
// 			// Update the user in the list to show request sent
// 			setUsers(
// 				users.map((user) =>
// 					user._id === userId
// 						? { ...user, friendRequestSent: true }
// 						: user,
// 				),
// 			);
// 		} catch (error) {
// 			console.error('Error sending friend request:', error);
// 		}
// 	};

// 	return (
// 		<div className='max-w-2xl mx-auto p-4'>
// 			<div className='mb-6'>
// 				<div className='flex gap-2'>
// 					<input
// 						type='text'
// 						placeholder='Search users...'
// 						value={searchTerm}
// 						onChange={(e) => setSearchTerm(e.target.value)}
// 						className='flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
// 						onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
// 					/>
// 					<button
// 						onClick={searchUsers}
// 						disabled={loading}
// 						className='bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md disabled:opacity-50'>
// 						{loading ? 'Searching...' : 'Search'}
// 					</button>
// 				</div>
// 			</div>

// 			<div>
// 				{users.map((user) => (
// 					<UserCard
// 						key={user._id}
// 						user={user}
// 						onSendFriendRequest={handleSendFriendRequest}
// 					/>
// 				))}
// 			</div>
// 		</div>
// 	);
// };

// export default UserSearch;

'use client';

import { useState } from 'react';
import Input from './Input';
import Button from './Button';

const UserSearch = ({ onSearch }) => {
	const [searchQuery, setSearchQuery] = useState('');
	const [minFriends, setMinFriends] = useState('');
	const [maxFriends, setMaxFriends] = useState('');
	const [isOnline, setIsOnline] = useState(''); // 'true', 'false', or ''

	const handleSearch = (e) => {
		e.preventDefault();
		onSearch({
			search: searchQuery,
			minFriends: minFriends || undefined,
			maxFriends: maxFriends || undefined,
			isOnline: isOnline === '' ? undefined : isOnline,
		});
	};

	return (
		<div className='p-6 bg-white shadow rounded-lg mb-6'>
			<h3 className='text-xl font-semibold text-gray-800 mb-4'>
				Search Users
			</h3>
			<form onSubmit={handleSearch} className='space-y-4'>
				<Input
					label='Name or Email'
					id='searchQuery'
					type='text'
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					placeholder='e.g., John Doe, john@example.com'
				/>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<div className='grid grid-cols-2 gap-4'>
						<Input
							label='Min Friends'
							id='minFriends'
							type='number'
							value={minFriends}
							onChange={(e) => setMinFriends(e.target.value)}
							placeholder='0'
							min='0'
						/>
						<Input
							label='Max Friends'
							id='maxFriends'
							type='number'
							value={maxFriends}
							onChange={(e) => setMaxFriends(e.target.value)}
							placeholder='1000'
							min='0'
						/>
					</div>
					<div>
						<label
							htmlFor='isOnline'
							className='block text-sm font-medium text-gray-700 mb-1'>
							Online Status
						</label>
						<select
							id='isOnline'
							value={isOnline}
							onChange={(e) => setIsOnline(e.target.value)}
							className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-300'>
							<option value=''>All</option>
							<option value='true'>Online</option>
							<option value='false'>Offline</option>
						</select>
					</div>
				</div>
				<Button
					type='submit'
					className='w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md'>
					Search
				</Button>
			</form>
		</div>
	);
};

export default UserSearch;
