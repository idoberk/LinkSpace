// import { useState, useEffect } from 'react';
// import ProfilePicture from './ProfilePicture';
// import api from '../lib/axios';
// import { useUser } from '../hooks/useUser';

// const FriendsDisplay = () => {
// 	// const { user } = useUser();
// 	// const [friends, setFriends] = useState([]);
// 	// const [loading, setLoading] = useState(false);

// 	// const fetchData = async () => {
// 	// 	if (!user?.friends || user.friends.length === 0) {
// 	// 		setFriends([]);
// 	// 		return;

// 	const { user } = useUser();
// 	const [friendsID] = useState(user?.friends || []);
// 	const [friends, setFriends] = useState([]);
// 	const [loading, setLoading] = useState(false);

// 	useEffect(() => {
// 		const fetchProfiles = async () => {
// 			try {
// 				setLoading(true);
// 				// const fetchedProfiles = await Promise.all(
// 				// 	friendsID.map(async (req) => {
// 				// 		try {
// 				// 			const res = await api.get(`/users/${req.user}`);
// 				// 			return { userId: req.user, profile: res.data };
// 				// 		} catch (err) {
// 				// 			console.error(
// 				// 				`Error fetching user ${req.user}`,
// 				// 				err,
// 				// 			);
// 				// 			return null;
// 				// 		}
// 				// 	}),
// 				// );
// 				const fetchedProfiles = await Promise.all(
// 					friendsID.map(async (friendId) => {
// 						try {
// 							const res = await api.get(`/users/${friendId}`);

// 							return {
// 								userId: friendId,
// 								profile: res.data.profile,
// 							};
// 						} catch (err) {
// 							console.error(
// 								`Error fetching user ${friendId}`,
// 								err,
// 							);
// 							return null;
// 						}
// 					}),
// 				);

// 				setFriends(fetchedProfiles.filter(Boolean));
// 			} catch (err) {
// 				console.error('Error fetching profiles:', err);
// 			} finally {
// 				setLoading(false);
// 			}
// 		};

// 		if (friendsID.length > 0) {
// 			fetchProfiles();
// 		}
// 	}, [friendsID]);

// 	// useEffect(() => {
// 	// 	fetchData();
// 	// }, [user]);

// 	return (
// 		<div>
// 			<div className='p-2 h-full overflow-y-auto'>
// 				<h3 className='text-lg text-gray-800 mb-4'>Friends</h3>
// 				{loading ? (
// 					<div className='text-gray-500 text-center py-4'>
// 						Loading...
// 					</div>
// 				) : friends.length > 0 ? (
// 					<div className='space-y-3'>
// 						{friends.map((friend) => (
// 							<div
// 								key={friend.userId}
// 								className='flex items-center gap-2 p-3 bg-gray-50 space-y-2 rounded-lg'>
// 								<ProfilePicture
// 									picture={friend?.profile?.avatar?.url}
// 									width={40}
// 									height={40}
// 								/>
// 								<h4 className='text-sm text-gray-800'>
// 									{friend?.profile?.firstName}{' '}
// 									{friend?.profile?.lastName}
// 								</h4>
// 							</div>
// 						))}
// 					</div>
// 				) : (
// 					<div className='text-gray-500 text-center py-4'>
// 						No friends found
// 					</div>
// 				)}
// 			</div>
// 		</div>
// 	);
// };

// export default FriendsDisplay;
import { useState, useEffect } from 'react';
import ProfilePicture from './ProfilePicture';
import api from '../lib/axios';
import { useUser } from '../hooks/useUser';

const FriendsDisplay = () => {
	const { user } = useUser();
	const [friends, setFriends] = useState([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchProfiles = async () => {
			if (!user?.friends || user.friends.length === 0) {
				setFriends([]);
				return;
			}

			try {
				setLoading(true);
				const fetchedProfiles = await Promise.all(
					user.friends.map(async (friendId) => {
						try {
							const res = await api.get(`/users/${friendId}`);

							return {
								userId: friendId,
								profile: res.data.profile,
							};
						} catch (err) {
							console.error(
								`Error fetching user ${friendId}`,
								err,
							);
							return null;
						}
					}),
				);

				setFriends(fetchedProfiles.filter(Boolean));
			} catch (err) {
				console.error('Error fetching profiles:', err);
			} finally {
				setLoading(false);
			}
		};

		fetchProfiles();
	}, [user?.friends]);

	return (
		<div>
			<div className='p-2 h-full overflow-y-auto'>
				<h3 className='text-lg text-gray-800 mb-4'>Friends</h3>
				{loading ? (
					<div className='text-gray-500 text-center py-4'>
						Loading...
					</div>
				) : friends.length > 0 ? (
					<div className='space-y-3'>
						{friends.map((friend) => (
							<div
								key={friend.userId}
								className='flex items-center gap-2 p-3 bg-gray-50 space-y-2 rounded-lg'>
								<ProfilePicture
									picture={friend?.profile?.avatar?.url}
									width={40}
									height={40}
								/>
								<h4 className='text-sm text-gray-800'>
									{friend?.profile?.firstName}{' '}
									{friend?.profile?.lastName}
								</h4>
							</div>
						))}
					</div>
				) : (
					<div className='text-gray-500 text-center py-4'>
						No friends found
					</div>
				)}
			</div>
		</div>
	);
};

export default FriendsDisplay;
