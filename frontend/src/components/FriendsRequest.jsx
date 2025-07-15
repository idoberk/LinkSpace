import { useState, useEffect } from 'react';
import api from '../lib/axios';
import FeedButton from './FeedButton';
import { useUser } from '../hooks/useUser';

const FriendsRequest = () => {
	const { user } = useUser();
	const [requestIds] = useState(user?.friendRequests?.received || []);
	const [friendRequests, setFriendRequests] = useState([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchProfiles = async () => {
			try {
				setLoading(true);
				const fetchedProfiles = await Promise.all(
					requestIds.map(async (req) => {
						try {
							const res = await api.get(`/users/${req.user}`);
							return { userId: req.user, profile: res.data };
						} catch (err) {
							console.error(
								`Error fetching user ${req.user}`,
								err,
							);
							return null;
						}
					}),
				);
				setFriendRequests(fetchedProfiles.filter(Boolean));
			} catch (err) {
				console.error('Error fetching profiles:', err);
			} finally {
				setLoading(false);
			}
		};

		if (requestIds.length > 0) {
			fetchProfiles();
		}
	}, [requestIds]);

	const handleAcceptRequest = async (userId) => {
		try {
			await api.post(`/users/${userId}/accept-friend`);
			setFriendRequests((prev) =>
				prev.filter((p) => p.userId !== userId),
			);
		} catch (error) {
			console.error('Error accepting friend request:', error);
			alert('Failed to accept friend request');
		}
	};

	const handleDeclineRequest = async (userId) => {
		try {
			await api.post(`/users/${userId}/reject-friend`);
			setFriendRequests((prev) =>
				prev.filter((p) => p.userId !== userId),
			);
		} catch (error) {
			console.error('Error declining friend request:', error);
			alert('Failed to decline friend request');
		}
	};

	return (
		<div className='p-2 h-full overflow-y-auto'>
			<h3 className='text-lg text-gray-800 mb-4'>Friend Requests</h3>

			{loading ? (
				<div className='text-gray-500 text-center py-4'>Loading...</div>
			) : friendRequests.length > 0 ? (
				<div className='space-y-3'>
					{friendRequests.map((req) => (
						<div
							key={req.userId}
							className='flex flex-col items-center p-3 bg-gray-50 rounded-lg space-y-2'>
							{/* <div className='w-12 h-12 bg-gray-300 rounded-full'></div> */}
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
