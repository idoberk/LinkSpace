// // import { useState, useEffect } from 'react';
// // import api from '../lib/axios';
// // import FeedButton from './FeedButton';

// // const FriendsRequest = () => {
// // 	const user = JSON.parse(localStorage.getItem('user'));
// // 	const [requestIds] = useState(user?.friendRequests?.received || []);
// // 	const [friendRequests, setFriendRequests] = useState([]);
// // 	const [loading, setLoading] = useState(false);

// // 	useEffect(() => {
// // 		const fetchProfiles = async () => {
// // 			try {
// // 				setLoading(true);
// // 				const fetchedProfiles = await Promise.all(
// // 					requestIds.map(async (req) => {
// // 						try {
// // 							const res = await api.get(`/users/${req.user}`);
// // 							return { userId: req.user, profile: res.data };
// // 						} catch (err) {
// // 							console.error(
// // 								`Error fetching user ${req.user}`,
// // 								err,
// // 							);
// // 							return null;
// // 						}
// // 					}),
// // 				);
// // 				setFriendRequests(fetchedProfiles.filter(Boolean));
// // 			} catch (err) {
// // 				console.error('Error fetching profiles:', err);
// // 			} finally {
// // 				setLoading(false);
// // 			}
// // 		};

// // 		if (requestIds.length > 0) {
// // 			fetchProfiles();
// // 		}
// // 	}, [requestIds]);

// // 	const handleAcceptRequest = async (userId) => {
// // 		try {
// // 			await api.post(`/users/${userId}/accept-friend`);
// // 			setFriendRequests((prev) =>
// // 				prev.filter((p) => p.userId !== userId),
// // 			);
// // 		} catch (error) {
// // 			console.error('Error accepting friend request:', error);
// // 			alert('Failed to accept friend request');
// // 		}
// // 	};

// // 	const handleDeclineRequest = async (userId) => {
// // 		try {
// // 			await api.post(`/users/${userId}/reject-friend`);
// // 			setFriendRequests((prev) =>
// // 				prev.filter((p) => p.userId !== userId),
// // 			);
// // 		} catch (error) {
// // 			console.error('Error declining friend request:', error);
// // 			alert('Failed to decline friend request');
// // 		}
// // 	};

// // 	return (
// // 		<div className='p-2  max-h-50 overflow-y-auto'>
// // 			<h3 className='text-lg text-gray-800 mb-4'>Friend Requests</h3>

// // 			{loading ? (
// // 				<div className='text-gray-500 text-center py-4'>Loading...</div>
// // 			) : friendRequests.length > 0 ? (
// // 				<div className='space-y-3'>
// // 					{friendRequests.map((req) => (
// // 						<div
// // 							key={req.userId}
// // 							className='flex flex-col items-center p-3 bg-gray-50 rounded-lg space-y-2'>
// // 							{/* <div className='w-12 h-12 bg-gray-300 rounded-full'></div> */}
// // 							<div className='text-center'>
// // 								<p className='font-medium text-sm'>
// // 									{req.profile?.profile?.firstName}{' '}
// // 									{req.profile?.profile?.lastName}
// // 								</p>
// // 								<p className='text-xs text-gray-500'>
// // 									Wants to be your friend
// // 								</p>
// // 							</div>
// // 							<div className='flex space-x-1'>
// // 								<FeedButton
// // 									onClick={() =>
// // 										handleAcceptRequest(req.userId)
// // 									}>
// // 									Accept
// // 								</FeedButton>
// // 								<FeedButton
// // 									onClick={() =>
// // 										handleDeclineRequest(req.userId)
// // 									}
// // 									className='bg-gray-300 text-gray-700 rounded hover:bg-gray-400'>
// // 									Decline
// // 								</FeedButton>
// // 							</div>
// // 						</div>
// // 					))}
// // 				</div>
// // 			) : (
// // 				<div className='text-gray-500 text-center py-8'>
// // 					<p className='text-sm'>No friend requests</p>
// // 					<p className='text-xs mt-1'>
// // 						When someone sends you a friend request, it will appear
// // 						here
// // 					</p>
// // 				</div>
// // 			)}
// // 		</div>
// // 	);
// // };

// // export default FriendsRequest;

// // import { useState, useEffect } from 'react';
// // import api from '../lib/axios';
// // import FeedButton from './FeedButton';
// // import { useUser } from '../hooks/useUser';

// // const FriendsRequest = () => {
// // 	// const { user, updateUser } = useUser();
// // 	// const [friendRequests, setFriendRequests] = useState([]);
// // 	// const [loading, setLoading] = useState(false);

// // 	// const fetchData = async () => {
// // 	// 	if (!user?.friendRequests?.received) {
// // 	// 		setFriendRequests([]);
// // 	// 		return;
// // 	// 	}
// // 	// 	try {
// // 	// 		setLoading(true);
// // 	// 		const fetchedProfiles = await Promise.all(
// // 	// 			user.friendRequests.received.map(async (req) => {
// // 	// 				try {
// // 	// 					const res = await api.get(`/users/${req.user}`);
// // 	// 					return { userId: req.user, profile: res.data };
// // 	// 				} catch (err) {
// // 	// 					console.error(`Error fetching user ${req.user}`, err);
// // 	// 					return null;
// // 	// 				}
// // 	// 			}),
// // 	// 		);
// // 	// 		setFriendRequests(fetchedProfiles.filter(Boolean));
// // 	// 	} catch (err) {
// // 	// 		console.error('Error fetching profiles:', err);
// // 	// 	} finally {
// // 	// 		setLoading(false);
// // 	// 	}
// // 	// };

// // 	// useEffect(() => {
// // 	// 	fetchData();
// // 	// }, [user]);

// // 	const { user, updateUser } = useUser();
// // 	const [friendsID] = useState(user?.friends || []);
// // 	const [friendRequests, setFriendRequests] = useState([]);
// // 	const [loading, setLoading] = useState(false);

// // 	useEffect(() => {
// // 		const fetchProfiles = async () => {
// // 			try {
// // 				setLoading(true);
// // 				const fetchedProfiles = await Promise.all(
// // 					friendsID.map(async (friendId) => {
// // 						try {
// // 							const res = await api.get(`/users/${friendId}`);

// // 							return {
// // 								userId: friendId,
// // 								profile: res.data.profile,
// // 							};
// // 						} catch (err) {
// // 							console.error(
// // 								`Error fetching user ${friendId}`,
// // 								err,
// // 							);
// // 							return null;
// // 						}
// // 					}),
// // 				);

// // 				setFriendRequests(fetchedProfiles.filter(Boolean));
// // 			} catch (err) {
// // 				console.error('Error fetching profiles:', err);
// // 			} finally {
// // 				setLoading(false);
// // 			}
// // 		};

// // 		if (friendsID.length > 0) {
// // 			fetchProfiles();
// // 		}
// // 	}, [friendsID]);

// // 	const handleAcceptRequest = async (userId) => {
// // 		try {
// // 			await api.post(`/users/${userId}/accept-friend`);
// // 			const updatedUser = await api.get('account/profile');
// // 			console.log({ updatedUser });
// // 			updateUser(updatedUser.data);
// // 		} catch (error) {
// // 			console.error('Error accepting friend request:', error);
// // 			alert('Failed to accept friend request');
// // 		}
// // 	};

// // 	const handleDeclineRequest = async (userId) => {
// // 		try {
// // 			await api.post(`/users/${userId}/reject-friend`);
// // 			const updatedUser = await api.get('/account/profile');
// // 			updateUser(updatedUser.data);
// // 		} catch (error) {
// // 			console.error('Error declining friend request:', error);
// // 			alert('Failed to decline friend request');
// // 		}
// // 	};

// // 	return (
// // 		<div className='p-2 max-h-50 overflow-y-auto'>
// // 			<h3 className='text-lg text-gray-800 mb-4'>Friend Requests</h3>
// // 			{loading ? (
// // 				<div className='text-gray-500 text-center py-4'>Loading...</div>
// // 			) : friendRequests.length > 0 ? (
// // 				<div className='space-y-3'>
// // 					{friendRequests.map((req) => (
// // 						<div
// // 							key={req.userId}
// // 							className='flex flex-col items-center p-3 bg-gray-50 rounded-lg space-y-2'>
// // 							<div className='text-center'>
// // 								<p className='font-medium text-sm'>
// // 									{req.profile?.profile?.firstName}{' '}
// // 									{req.profile?.profile?.lastName}
// // 								</p>
// // 								<p className='text-xs text-gray-500'>
// // 									Wants to be your friend
// // 								</p>
// // 							</div>
// // 							<div className='flex space-x-1'>
// // 								<FeedButton
// // 									onClick={() =>
// // 										handleAcceptRequest(req.userId)
// // 									}>
// // 									Accept
// // 								</FeedButton>
// // 								<FeedButton
// // 									onClick={() =>
// // 										handleDeclineRequest(req.userId)
// // 									}
// // 									className='bg-gray-300 text-gray-700 rounded hover:bg-gray-400'>
// // 									Decline
// // 								</FeedButton>
// // 							</div>
// // 						</div>
// // 					))}
// // 				</div>
// // 			) : (
// // 				<div className='text-gray-500 text-center py-8'>
// // 					<p className='text-sm'>No friend requests</p>
// // 					<p className='text-xs mt-1'>
// // 						When someone sends you a friend request, it will appear
// // 						here
// // 					</p>
// // 				</div>
// // 			)}
// // 		</div>
// // 	);
// // };

// // export default FriendsRequest;

// // const FriendsRequest = () => {
// // 	const { user, setUser } = useUser();
// // 	const [requestsID, setRequestsID] = useState(
// // 		user?.friendRequests?.received || [],
// // 	);
// // 	console.log({ requestsID });
// // 	const [friendRequests, setFriendRequests] = useState([]);
// // 	const [loading, setLoading] = useState(false);

// // 	useEffect(() => {
// // 		setRequestsID(user?.friendRequests?.received || []);
// // 	}, [user]);

// // 	useEffect(() => {
// // 		const fetchProfiles = async () => {
// // 			try {
// // 				setLoading(true);
// // 				const fetchedProfiles = await Promise.all(
// // 					requestsID.map(async (req) => {
// // 						const userId = req.user;
// // 						try {
// // 							const res = await api.get(`/users/${userId}`);
// // 							return {
// // 								userId,
// // 								profile: res.data.profile,
// // 							};
// // 						} catch (err) {
// // 							console.error(`Error fetching user ${userId}`, err);
// // 							return null;
// // 						}
// // 					}),
// // 				);
// // 				setFriendRequests(fetchedProfiles.filter(Boolean));
// // 			} catch (err) {
// // 				console.error('Error fetching profiles:', err);
// // 			} finally {
// // 				setLoading(false);
// // 			}
// // 		};

// // 		if (requestsID.length > 0) {
// // 			fetchProfiles();
// // 		}
// // 	}, [requestsID]);

// // 	const handleAcceptRequest = async (userId) => {
// // 		try {
// // 			await api.post(`/users/${userId}/accept-friend`);
// // 			const updatedUser = await api.get('/account/profile');
// // 			// setUser(updatedUser.data);
// // 			setUser({ ...updatedUser.data });

// // 			setRequestsID(updatedUser.data.friendRequests.received || []);
// // 		} catch (error) {
// // 			console.error('Error accepting friend request:', error);
// // 			alert('Failed to accept friend request');
// // 		}
// // 	};

// // 	const handleDeclineRequest = async (userId) => {
// // 		try {
// // 			await api.post(`/users/${userId}/reject-friend`);
// // 			const updatedUser = await api.get('/account/profile');
// // 			setUser(updatedUser.data);
// // 		} catch (error) {
// // 			console.error('Error declining friend request:', error);
// // 			alert('Failed to decline friend request');
// // 		}
// // 	};

// // 	return (
// // 		<div className='p-2 max-h-50 overflow-y-auto'>
// // 			<h3 className='text-lg text-gray-800 mb-4'>Friend Requests</h3>
// // 			{loading ? (
// // 				<div className='text-gray-500 text-center py-4'>Loading...</div>
// // 			) : friendRequests.length > 0 ? (
// // 				<div className='space-y-3'>
// // 					{friendRequests.map((req) => (
// // 						<div
// // 							key={req.userId}
// // 							className='flex flex-col items-center p-3 bg-gray-50 rounded-lg space-y-2'>
// // 							<div className='text-center'>
// // 								<p className='font-medium text-sm'>
// // 									{req.profile?.firstName}{' '}
// // 									{req.profile?.lastName}
// // 								</p>
// // 								<p className='text-xs text-gray-500'>
// // 									Wants to be your friend
// // 								</p>
// // 							</div>
// // 							<div className='flex space-x-1'>
// // 								<FeedButton
// // 									onClick={() =>
// // 										handleAcceptRequest(req.userId)
// // 									}>
// // 									Accept
// // 								</FeedButton>
// // 								<FeedButton
// // 									onClick={() =>
// // 										handleDeclineRequest(req.userId)
// // 									}
// // 									className='bg-gray-300 text-gray-700 rounded hover:bg-gray-400'>
// // 									Decline
// // 								</FeedButton>
// // 							</div>
// // 						</div>
// // 					))}
// // 				</div>
// // 			) : (
// // 				<div className='text-gray-500 text-center py-8'>
// // 					<p className='text-sm'>No friend requests</p>
// // 					<p className='text-xs mt-1'>
// // 						When someone sends you a friend request, it will appear
// // 						here
// // 					</p>
// // 				</div>
// // 			)}
// // 		</div>
// // 	);
// // };

// // export default FriendsRequest;
// // import { useState, useEffect } from 'react';
// // import api from '../lib/axios';
// // import FeedButton from './FeedButton';

// // const FriendsRequest = () => {
// // 	const user = JSON.parse(localStorage.getItem('user'));
// // 	const [requestIds] = useState(user?.friendRequests?.received || []);
// // 	const [friendRequests, setFriendRequests] = useState([]);
// // 	const [loading, setLoading] = useState(false);

// // 	useEffect(() => {
// // 		const fetchProfiles = async () => {
// // 			try {
// // 				setLoading(true);
// // 				const fetchedProfiles = await Promise.all(
// // 					requestIds.map(async (req) => {
// // 						try {
// // 							const res = await api.get(`/users/${req.user}`);
// // 							return { userId: req.user, profile: res.data };
// // 						} catch (err) {
// // 							console.error(
// // 								`Error fetching user ${req.user}`,
// // 								err,
// // 							);
// // 							return null;
// // 						}
// // 					}),
// // 				);
// // 				setFriendRequests(fetchedProfiles.filter(Boolean));
// // 			} catch (err) {
// // 				console.error('Error fetching profiles:', err);
// // 			} finally {
// // 				setLoading(false);
// // 			}
// // 		};

// // 		if (requestIds.length > 0) {
// // 			fetchProfiles();
// // 		}
// // 	}, [requestIds]);

// // 	const handleAcceptRequest = async (userId) => {
// // 		try {
// // 			await api.post(`/users/${userId}/accept-friend`);
// // 			setFriendRequests((prev) =>
// // 				prev.filter((p) => p.userId !== userId),
// // 			);
// // 		} catch (error) {
// // 			console.error('Error accepting friend request:', error);
// // 			alert('Failed to accept friend request');
// // 		}
// // 	};

// // 	const handleDeclineRequest = async (userId) => {
// // 		try {
// // 			await api.post(`/users/${userId}/reject-friend`);
// // 			setFriendRequests((prev) =>
// // 				prev.filter((p) => p.userId !== userId),
// // 			);
// // 		} catch (error) {
// // 			console.error('Error declining friend request:', error);
// // 			alert('Failed to decline friend request');
// // 		}
// // 	};

// // 	return (
// // 		<div className='p-2  max-h-50 overflow-y-auto'>
// // 			<h3 className='text-lg text-gray-800 mb-4'>Friend Requests</h3>

// // 			{loading ? (
// // 				<div className='text-gray-500 text-center py-4'>Loading...</div>
// // 			) : friendRequests.length > 0 ? (
// // 				<div className='space-y-3'>
// // 					{friendRequests.map((req) => (
// // 						<div
// // 							key={req.userId}
// // 							className='flex flex-col items-center p-3 bg-gray-50 rounded-lg space-y-2'>
// // 							{/* <div className='w-12 h-12 bg-gray-300 rounded-full'></div> */}
// // 							<div className='text-center'>
// // 								<p className='font-medium text-sm'>
// // 									{req.profile?.profile?.firstName}{' '}
// // 									{req.profile?.profile?.lastName}
// // 								</p>
// // 								<p className='text-xs text-gray-500'>
// // 									Wants to be your friend
// // 								</p>
// // 							</div>
// // 							<div className='flex space-x-1'>
// // 								<FeedButton
// // 									onClick={() =>
// // 										handleAcceptRequest(req.userId)
// // 									}>
// // 									Accept
// // 								</FeedButton>
// // 								<FeedButton
// // 									onClick={() =>
// // 										handleDeclineRequest(req.userId)
// // 									}
// // 									className='bg-gray-300 text-gray-700 rounded hover:bg-gray-400'>
// // 									Decline
// // 								</FeedButton>
// // 							</div>
// // 						</div>
// // 					))}
// // 				</div>
// // 			) : (
// // 				<div className='text-gray-500 text-center py-8'>
// // 					<p className='text-sm'>No friend requests</p>
// // 					<p className='text-xs mt-1'>
// // 						When someone sends you a friend request, it will appear
// // 						here
// // 					</p>
// // 				</div>
// // 			)}
// // 		</div>
// // 	);
// // };

// // export default FriendsRequest;

// import { useState, useEffect } from 'react';
// import api from '../lib/axios';
// import FeedButton from './FeedButton';
// import { useUser } from '../hooks/useUser';

// const FriendsRequest = () => {
// 	const { user, setUser } = useUser();
// 	const [friendRequests, setFriendRequests] = useState([]);
// 	const [loading, setLoading] = useState(false);

// 	const fetchData = async () => {
// 		if (!user?.friendRequests?.received) {
// 			setFriendRequests([]);
// 			return;
// 		}
// 		try {
// 			setLoading(true);
// 			const fetchedProfiles = await Promise.all(
// 				user.friendRequests.received.map(async (req) => {
// 					try {
// 						const res = await api.get(`/users/${req.user}`);
// 						return { userId: req.user, profile: res.data };
// 					} catch (err) {
// 						console.error(`Error fetching user ${req.user}`, err);
// 						return null;
// 					}
// 				}),
// 			);
// 			setFriendRequests(fetchedProfiles.filter(Boolean));
// 		} catch (err) {
// 			console.error('Error fetching profiles:', err);
// 		} finally {
// 			setLoading(false);
// 		}
// 	};

// 	useEffect(() => {
// 		fetchData();
// 	}, [user]);

// 	const handleAcceptRequest = async (userId) => {
// 		try {
// 			await api.post(`/users/${userId}/accept-friend`);
// 			const updatedUser = await api.get('account/profile');
// 			console.log({ updatedUser });
// 			setUser(updatedUser.data);
// 		} catch (error) {
// 			console.error('Error accepting friend request:', error);
// 			alert('Failed to accept friend request');
// 		}
// 	};

// 	const handleDeclineRequest = async (userId) => {
// 		try {
// 			await api.post(`/users/${userId}/reject-friend`);
// 			const updatedUser = await api.get('/account/profile');
// 			setUser(updatedUser.data);
// 		} catch (error) {
// 			console.error('Error declining friend request:', error);
// 			alert('Failed to decline friend request');
// 		}
// 	};

// 	return (
// 		<div className='p-2 max-h-50 overflow-y-auto'>
// 			<h3 className='text-lg text-gray-800 mb-4'>Friend Requests</h3>
// 			{loading ? (
// 				<div className='text-gray-500 text-center py-4'>Loading...</div>
// 			) : friendRequests.length > 0 ? (
// 				<div className='space-y-3'>
// 					{friendRequests.map((req) => (
// 						<div
// 							key={req.userId}
// 							className='flex flex-col items-center p-3 bg-gray-50 rounded-lg space-y-2'>
// 							<div className='text-center'>
// 								<p className='font-medium text-sm'>
// 									{req.profile?.profile?.firstName}{' '}
// 									{req.profile?.profile?.lastName}
// 								</p>
// 								<p className='text-xs text-gray-500'>
// 									Wants to be your friend
// 								</p>
// 							</div>
// 							<div className='flex space-x-1'>
// 								<FeedButton
// 									onClick={() =>
// 										handleAcceptRequest(req.userId)
// 									}>
// 									Accept
// 								</FeedButton>
// 								<FeedButton
// 									onClick={() =>
// 										handleDeclineRequest(req.userId)
// 									}
// 									className='bg-gray-300 text-gray-700 rounded hover:bg-gray-400'>
// 									Decline
// 								</FeedButton>
// 							</div>
// 						</div>
// 					))}
// 				</div>
// 			) : (
// 				<div className='text-gray-500 text-center py-8'>
// 					<p className='text-sm'>No friend requests</p>
// 					<p className='text-xs mt-1'>
// 						When someone sends you a friend request, it will appear
// 						here
// 					</p>
// 				</div>
// 			)}
// 		</div>
// 	);
// };

// export default FriendsRequest;

import { useState, useEffect } from 'react';
import api from '../lib/axios';
import FeedButton from './FeedButton';
import { useUser } from '../hooks/useUser';

const FriendsRequest = () => {
	const { user, setUser } = useUser();
	const [friendRequests, setFriendRequests] = useState([]);
	const [loading, setLoading] = useState(false);

	const fetchData = async () => {
		console.log('Fetching friend requests data...');
		console.log(
			'User friend requests received:',
			user?.friendRequests?.received,
		);

		if (!user?.friendRequests?.received) {
			console.log('No friend requests received, setting empty array');
			setFriendRequests([]);
			return;
		}

		try {
			setLoading(true);
			console.log(
				'Fetching profiles for',
				user.friendRequests.received.length,
				'friend requests',
			);

			const fetchedProfiles = await Promise.all(
				user.friendRequests.received.map(async (req) => {
					try {
						console.log('Fetching user profile for:', req.user);
						const res = await api.get(`/users/${req.user}`);
						console.log(
							'Fetched profile for',
							req.user,
							':',
							res.data,
						);
						return { userId: req.user, profile: res.data };
					} catch (err) {
						console.error(`Error fetching user ${req.user}`, err);
						return null;
					}
				}),
			);

			const validProfiles = fetchedProfiles.filter(Boolean);
			console.log('Valid friend request profiles:', validProfiles);
			setFriendRequests(validProfiles);
		} catch (err) {
			console.error('Error fetching profiles:', err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, [user]);

	const handleAcceptRequest = async (userId) => {
		try {
			console.log('Accepting friend request from:', userId);
			await api.post(`/users/${userId}/accept-friend`);
			console.log('Friend request accepted successfully');

			// Update local state immediately
			setFriendRequests((prev) =>
				prev.filter((req) => req.userId !== userId),
			);

			// Update user data optimistically
			setUser((prevUser) => ({
				...prevUser,
				friends: [...(prevUser.friends || []), userId],
				friendRequests: {
					...prevUser.friendRequests,
					received:
						prevUser.friendRequests?.received?.filter(
							(req) => req.user.toString() !== userId,
						) || [],
				},
			}));

			alert('Friend request accepted successfully!');
		} catch (error) {
			console.error('Error accepting friend request:', error);
			console.error('Error response:', error.response?.data);
			const errorMessage =
				error.response?.data?.errors?.message ||
				'Failed to accept friend request';
			alert(`Error: ${errorMessage}`);
		}
	};

	const handleDeclineRequest = async (userId) => {
		try {
			console.log('Declining friend request from:', userId);
			await api.post(`/users/${userId}/reject-friend`);
			console.log('Friend request declined successfully');

			// Update local state immediately
			setFriendRequests((prev) =>
				prev.filter((req) => req.userId !== userId),
			);

			// Update user data optimistically - only remove from friend requests, don't add to friends
			setUser((prevUser) => ({
				...prevUser,
				friendRequests: {
					...prevUser.friendRequests,
					received:
						prevUser.friendRequests?.received?.filter(
							(req) => req.user.toString() !== userId,
						) || [],
				},
			}));

			alert('Friend request declined successfully!');
		} catch (error) {
			console.error('Error declining friend request:', error);
			console.error('Error response:', error.response?.data);
			const errorMessage =
				error.response?.data?.errors?.message ||
				'Failed to decline friend request';
			alert(`Error: ${errorMessage}`);
		}
	};

	return (
		<div className='p-2 max-h-50 overflow-y-auto'>
			<h3 className='text-lg text-gray-800 mb-4'>Friend Requests</h3>
			{loading ? (
				<div className='text-gray-500 text-center py-4'>Loading...</div>
			) : friendRequests.length > 0 ? (
				<div className='space-y-3'>
					{friendRequests.map((req) => (
						<div
							key={req.userId}
							className='flex flex-col items-center p-3 bg-gray-50 rounded-lg space-y-2'>
							<div className='text-center'>
								<p className='font-medium text-sm'>
									{req.profile?.profile?.firstName}{' '}
									{req.profile?.profile?.lastName}
								</p>
								<p className='text-xs text-gray-500'>
									Wants to be your friend
								</p>
							</div>
							<div className='flex space-x-1'>
								<FeedButton
									onClick={() =>
										handleAcceptRequest(req.userId)
									}>
									Accept
								</FeedButton>
								<FeedButton
									onClick={() =>
										handleDeclineRequest(req.userId)
									}
									className='bg-gray-300 text-gray-700 rounded hover:bg-gray-400'>
									Decline
								</FeedButton>
							</div>
						</div>
					))}
				</div>
			) : (
				<div className='text-gray-500 text-center py-8'>
					<p className='text-sm'>No friend requests</p>
					<p className='text-xs mt-1'>
						When someone sends you a friend request, it will appear
						here
					</p>
				</div>
			)}
		</div>
	);
};

export default FriendsRequest;
