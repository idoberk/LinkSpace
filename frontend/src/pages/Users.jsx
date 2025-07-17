// 'use client';

// import { useState, useEffect } from 'react';
// import api from '../lib/axios';
// import UserCard from '../components/UserCard';
// import UserSearch from '../components/UserSearch';

// const Users = () => {
// 	const [activeTab, setActiveTab] = useState('friends');
// 	const [friends, setFriends] = useState([]);
// 	const [loading, setLoading] = useState(false);

// 	useEffect(() => {
// 		if (activeTab === 'friends') {
// 			fetchFriends();
// 		}
// 	}, [activeTab]);

// 	const fetchFriends = async () => {
// 		setLoading(true);
// 		try {
// 			const response = await api.get('/api/users/friends');
// 			setFriends(response.data);
// 		} catch (error) {
// 			console.error('Error fetching friends:', error);
// 		} finally {
// 			setLoading(false);
// 		}
// 	};

// 	return (
// 		<div className='max-w-4xl mx-auto p-4'>
// 			<h1 className='text-3xl font-bold mb-6'>Users</h1>

// 			{/* Tabs */}
// 			<div className='flex border-b mb-6'>
// 				<button
// 					onClick={() => setActiveTab('friends')}
// 					className={`px-4 py-2 font-medium ${
// 						activeTab === 'friends'
// 							? 'text-blue-600 border-b-2 border-blue-600'
// 							: 'text-gray-500 hover:text-gray-700'
// 					}`}>
// 					Friends
// 				</button>
// 				<button
// 					onClick={() => setActiveTab('search')}
// 					className={`px-4 py-2 font-medium ${
// 						activeTab === 'search'
// 							? 'text-blue-600 border-b-2 border-blue-600'
// 							: 'text-gray-500 hover:text-gray-700'
// 					}`}>
// 					Search Users
// 				</button>
// 			</div>

// 			{/* Content */}
// 			{activeTab === 'friends' && (
// 				<div>
// 					{loading ? (
// 						<p>Loading...</p>
// 					) : friends.length > 0 ? (
// 						friends.map((friend) => (
// 							<UserCard
// 								key={friend._id}
// 								user={friend}
// 								onSendFriendRequest={() => {}}
// 							/>
// 						))
// 					) : (
// 						<p className='text-gray-500'>
// 							You don't have any friends yet.
// 						</p>
// 					)}
// 				</div>
// 			)}

// 			{activeTab === 'search' && <UserSearch />}
// 		</div>
// 	);
// };

// export default Users;
import { useState } from 'react';
import api from '../lib/axios';
import { useUser } from '../hooks/useUser';

const Users = () => {
	const { user, setUser } = useUser();
	const [searchQuery, setSearchQuery] = useState('');
	const [searchResults, setSearchResults] = useState([]);
	const [loading, setLoading] = useState(false);

	const handleSearch = async () => {
		setLoading(true);
		try {
			const res = await api.get(`/users/search?firstName=${searchQuery}`);
			setSearchResults(res.data.users);
		} catch (err) {
			console.error('Search error:', err);
		} finally {
			setLoading(false);
		}
	};

	const handleSendRequest = async (targetUserId) => {
		try {
			await api.post(`/users/${targetUserId}/friend-request`);
			// נעדכן את הcontext
			setUser({
				...user,
				friendRequests: {
					...user.friendRequests,
					sent: [...user.friendRequests.sent, targetUserId],
				},
			});
		} catch (err) {
			console.error('Error sending request:', err);
		}
	};

	const handleAcceptRequest = async (senderId) => {
		try {
			await api.post(`/users/${senderId}/friend-request/accept`);
			setUser({
				...user,
				friends: [...user.friends, senderId],
				friendRequests: {
					...user.friendRequests,
					received: user.friendRequests.received.filter(
						(u) => u._id !== senderId,
					),
				},
			});
		} catch (err) {
			console.error('Error accepting request:', err);
		}
	};

	const handleDeclineRequest = async (senderId) => {
		try {
			await api.post(`/users/${senderId}/friend-request/decline`);
			setUser({
				...user,
				friendRequests: {
					...user.friendRequests,
					received: user.friendRequests.received.filter(
						(u) => u._id !== senderId,
					),
				},
			});
		} catch (err) {
			console.error('Error declining request:', err);
		}
	};

	return (
		<div className='max-w-xl mx-auto p-4'>
			<h1 className='text-2xl font-bold mb-4'>Find Friends</h1>

			<input
				type='text'
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				placeholder='Search by first name...'
				className='border p-2 rounded w-full mb-4'
			/>
			<button
				onClick={handleSearch}
				className='bg-blue-600 text-white px-4 py-2 rounded mb-6'>
				Search
			</button>

			{loading && <p>Loading...</p>}

			<div className='mt-4'>
				{searchResults.map((userResult) => {
					const alreadyFriend = user.friends.some(
						(f) => f._id === userResult._id,
					);
					const alreadyRequested = user.friendRequests.sent.some(
						(f) => f._id === userResult._id,
					);

					return (
						<div
							key={userResult._id}
							className='flex items-center gap-4 border p-2 mb-2 rounded'>
							<img
								src={
									userResult.profile.avatar ||
									'https://via.placeholder.com/50'
								}
								alt={`${userResult.profile.firstName}`}
								className='w-12 h-12 rounded-full object-cover'
							/>
							<div>
								<p className='font-semibold'>
									{userResult.profile.firstName}{' '}
									{userResult.profile.lastName}
								</p>
							</div>

							{!alreadyFriend && !alreadyRequested && (
								<button
									onClick={() =>
										handleSendRequest(userResult._id)
									}
									className='ml-auto bg-green-600 text-white px-3 py-1 rounded'>
									Add Friend
								</button>
							)}

							{alreadyRequested && (
								<span className='ml-auto text-yellow-600 font-semibold'>
									Pending
								</span>
							)}
						</div>
					);
				})}
			</div>

			<h2 className='text-xl font-bold mt-8 mb-2'>Friend Requests</h2>
			{user.friendRequests.received.length === 0 && (
				<p className='text-gray-600'>No pending requests.</p>
			)}
			{user.friendRequests.received.map((requestUser) => (
				<div
					key={requestUser._id}
					className='flex items-center gap-4 border p-2 mb-2 rounded'>
					<img
						src={
							requestUser.profile.avatar ||
							'https://via.placeholder.com/50'
						}
						alt={`${requestUser.profile.firstName}`}
						className='w-12 h-12 rounded-full object-cover'
					/>
					<div>
						<p className='font-semibold'>
							{requestUser.profile.firstName}{' '}
							{requestUser.profile.lastName}
						</p>
					</div>
					<button
						onClick={() => handleAcceptRequest(requestUser._id)}
						className='ml-auto bg-blue-600 text-white px-3 py-1 rounded mr-2'>
						Accept
					</button>
					<button
						onClick={() => handleDeclineRequest(requestUser._id)}
						className='bg-red-600 text-white px-3 py-1 rounded'>
						Decline
					</button>
				</div>
			))}
		</div>
	);
};

export default Users;
