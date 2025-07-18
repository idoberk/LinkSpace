// import { useEffect, useRef, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';
// import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
// import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded';
// import api from '../lib/axios';
// import FeedButton from './FeedButton';
// import ProfilePicture from './ProfilePicture';
// import DeleteAccountModal from './DeleteAccount';
// import { useUser } from '../hooks/useUser';

// // import { useLocation } from 'react-router-dom';

// const TopBar = () => {
// 	const navigate = useNavigate();
// 	const { user, logout } = useUser();
// 	const [showSettingsMenu, setShowSettingsMenu] = useState(false);
// 	const settingMenuRef = useRef(null);
// 	const [showDeleteModal, setShowDeleteModal] = useState(false);
// 	const [deleting, setDeleting] = useState(false);
// 	const [deleteError, setDeleteError] = useState('');
// 	// const location = useLocation();
// 	// const [searchText, setSearchText] = useState('');
// 	// const isFeedOrProfile =
// 	// 	location.pathname === '/home' ||
// 	// 	location.pathname.startsWith('/profile');

// 	const handleLogout = async () => {
// 		try {
// 			await api.post('/account/logout');
// 		} catch (error) {
// 			console.error('Backend logout failed:', error);
// 		}

// 		logout();
// 		navigate('/login');
// 	};

// 	useEffect(() => {
// 		const handleClickOutside = (event) => {
// 			if (
// 				settingMenuRef.current &&
// 				!settingMenuRef.current.contains(event.target)
// 			) {
// 				setShowSettingsMenu(false);
// 			}
// 		};

// 		document.addEventListener('mousedown', handleClickOutside);
// 		return () => {
// 			document.removeEventListener('mousedown', handleClickOutside);
// 		};
// 	}, []);

// 	// const handleSearch = () => {
// 	// 	if (isFeedOrProfile) {
// 	// 		navigate(
// 	// 			`${location.pathname}?search=${encodeURIComponent(searchText)}`,
// 	// 		);
// 	// 	}
// 	// };

// 	const handleDeleteAccount = async (password) => {
// 		setDeleteError('');
// 		try {
// 			setDeleting(true);
// 			await api.delete('/account/', {
// 				data: { password },
// 			});
// 			alert('Your account has been deleted');
// 			setShowDeleteModal(false);
// 			logout();
// 			navigate('/login');
// 		} catch (err) {
// 			console.error('Error deleting account:', err);
// 			setDeleteError(
// 				err?.response?.data?.errors?.message ||
// 					'Failed to delete account',
// 			);
// 		} finally {
// 			setDeleting(false);
// 		}
// 	};

// 	const handleCancelDelete = () => {
// 		setShowDeleteModal(false);
// 		setDeleteError('');
// 	};

// 	return (
// 		<div className='top-bar-container z-50 fixed top-0 left-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex justify-between items-center p-4 w-full h-16'>
// 			<span className='top-bar-left'>
// 				<Link
// 					to='/home'
// 					className='text-2xl font-bold text-gray-800 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded transition-shadow duration-200'
// 					style={{ textShadow: '3px 3px 1px rgba(50,50,50,0.3)' }}
// 					aria-label='Go to home page'>
// 					LinkSpace
// 				</Link>
// 			</span>
// 			<span className='top-bar-center'>
// 				<span className='search-bar flex justify-start items-center bg-white rounded-full p-2 w-80'>
// 					<SearchOutlinedIcon className='ml-2' />
// 					<input
// 						type='text'
// 						// value={searchText}
// 						className='ml-2 bg-transparent outline-none'
// 						placeholder='Search'
// 						// onChange={(e) => setSearchText(e.target.value)}
// 						// onKeyDown={(e) => {
// 						// 	if (e.key === 'Enter' && isFeedOrProfile)
// 						// 		handleSearch();
// 						// }}
// 					/>
// 				</span>
// 			</span>
// 			<div className='top-bar-right flex justify-center items-center'>
// 				<span className='mr-3 font-bold text-gray-800 text-xl self-center'>
// 					{user?.profile?.firstName} {user?.profile?.lastName}
// 				</span>
// 				<ProfilePicture
// 					width={50}
// 					height={50}
// 					picture={user?.profile?.avatar?.url}
// 				/>
// 				<div ref={settingMenuRef}>
// 					<SettingsSuggestRoundedIcon
// 						className='mr-5 ml-5 hover:bg-white rounded-full hover:cursor-pointer transition'
// 						onClick={() => setShowSettingsMenu(!showSettingsMenu)}
// 					/>
// 					{showSettingsMenu && (
// 						<div className='absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[200px] z-10'>
// 							<button
// 								onClick={() => {
// 									setShowSettingsMenu(false);
// 									navigate('/profile', {
// 										state: { editMode: 'inline' },
// 									});
// 								}}
// 								className='w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2'>
// 								<span>Edit Profile</span>
// 							</button>
// 							<hr className='w-full border-gray-200' />
// 							<button
// 								onClick={() => {
// 									setShowSettingsMenu(false);
// 									navigate('/profile', {
// 										state: { editMode: 'settings' },
// 									});
// 								}}
// 								className='w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2'></button>
// 							<hr className='w-full border-gray-200' />
// 							<button
// 								className='w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600'
// 								onClick={() => setShowDeleteModal(true)}>
// 								<span>Delete Account</span>
// 							</button>
// 						</div>
// 					)}
// 				</div>
// 				<FeedButton
// 					onClick={handleLogout}
// 					className='hover:bg-blue-300 bg-white'>
// 					Logout
// 				</FeedButton>

// 				{showDeleteModal && (
// 					<DeleteAccountModal
// 						deleting={deleting}
// 						onCancel={handleCancelDelete}
// 						onDelete={handleDeleteAccount}
// 						error={deleteError}
// 					/>
// 				)}
// 			</div>
// 		</div>
// 	);
// };

// export default TopBar;

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import api from '../lib/axios';
import FeedButton from './FeedButton';
import ProfilePicture from './ProfilePicture';
import DeleteAccountModal from './DeleteAccount';
import { useUser } from '../hooks/useUser';

const TopBar = () => {
	const navigate = useNavigate();
	const { user, logout, updateUser } = useUser();
	const [showSettingsMenu, setShowSettingsMenu] = useState(false);
	const settingMenuRef = useRef(null);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState('');

	// Search states
	const [searchQuery, setSearchQuery] = useState('');
	const [searchResults, setSearchResults] = useState([]);
	const [showSearchResults, setShowSearchResults] = useState(false);
	const [searchLoading, setSearchLoading] = useState(false);
	const [friendRequests, setFriendRequests] = useState(new Set());
	const [friendRequestStatus, setFriendRequestStatus] = useState({});
	const searchRef = useRef(null);

	const handleLogout = async () => {
		try {
			await api.post('/account/logout');
		} catch (error) {
			console.error('Backend logout failed:', error);
		}

		logout();
		navigate('/login');
	};

	// Search functionality
	const searchUsers = async (query) => {
		if (!query.trim()) {
			setSearchResults([]);
			setShowSearchResults(false);
			return;
		}

		setSearchLoading(true);
		try {
			const response = await api.get(
				`/users?search=${encodeURIComponent(query)}&limit=5`,
			);
			setSearchResults(response.data.users || []);
			setShowSearchResults(true);
		} catch (error) {
			console.error('Search error:', error);
			setSearchResults([]);
		} finally {
			setSearchLoading(false);
		}
	};

	// Debounced search
	useEffect(() => {
		const timer = setTimeout(() => {
			searchUsers(searchQuery);
		}, 300);

		return () => clearTimeout(timer);
	}, [searchQuery]);

	// Check if user is already a friend or has pending request
	const isAlreadyFriend = (userId) => {
		const isFriend = user?.friends?.some(
			(friendId) => friendId.toString() === userId,
		);
		console.log(`Checking if ${userId} is already friend:`, isFriend);
		console.log('User friends:', user?.friends);
		return isFriend;
	};

	const hasPendingRequest = (userId) => {
		const hasRequest = user?.friendRequests?.sent?.some(
			(req) => req.user.toString() === userId,
		);
		console.log(`Checking if ${userId} has pending request:`, hasRequest);
		console.log('User sent requests:', user?.friendRequests?.sent);
		return hasRequest;
	};

	// Send friend request
	const sendFriendRequest = async (userId) => {
		console.log('Sending friend request to userId:', userId);
		console.log('Current user:', user);

		try {
			// Set loading state
			setFriendRequestStatus((prev) => ({
				...prev,
				[userId]: 'loading',
			}));

			console.log(
				'Making API call to:',
				`/users/${userId}/friend-request`,
			);
			await api.post(`/users/${userId}/friend-request`);
			console.log('Friend request sent successfully');

			// Set success state
			setFriendRequests((prev) => new Set(prev).add(userId));
			setFriendRequestStatus((prev) => ({
				...prev,
				[userId]: 'success',
			}));

			// Update user data to reflect the new friend request
			try {
				const updatedUser = await api.get('account/profile');
				console.log('Updated user data:', updatedUser.data);
				updateUser(updatedUser.data);
			} catch (error) {
				console.error('Error updating user data:', error);
			}

			// Show success message
			alert('Friend request sent successfully!');

			// Clear status after 3 seconds
			setTimeout(() => {
				setFriendRequestStatus((prev) => {
					const newStatus = { ...prev };
					delete newStatus[userId];
					return newStatus;
				});
			}, 3000);
		} catch (error) {
			console.error('Error sending friend request:', error);
			console.error('Error response:', error.response?.data);

			// Set error state
			setFriendRequestStatus((prev) => ({ ...prev, [userId]: 'error' }));

			// Show error message
			const errorMessage =
				error.response?.data?.errors?.message ||
				'Failed to send friend request';
			alert(`Error: ${errorMessage}`);

			// Clear error status after 3 seconds
			setTimeout(() => {
				setFriendRequestStatus((prev) => {
					const newStatus = { ...prev };
					delete newStatus[userId];
					return newStatus;
				});
			}, 3000);
		}
	};

	// Close menus when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				settingMenuRef.current &&
				!settingMenuRef.current.contains(event.target)
			) {
				setShowSettingsMenu(false);
			}
			if (
				searchRef.current &&
				!searchRef.current.contains(event.target)
			) {
				setShowSearchResults(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const handleDeleteAccount = async (password) => {
		setDeleteError('');
		try {
			setDeleting(true);
			await api.delete('/account/', {
				data: { password },
			});
			alert('Your account has been deleted');
			setShowDeleteModal(false);
			logout();
			navigate('/login');
		} catch (err) {
			console.error('Error deleting account:', err);
			setDeleteError(
				err?.response?.data?.errors?.message ||
					'Failed to delete account',
			);
		} finally {
			setDeleting(false);
		}
	};

	const handleCancelDelete = () => {
		setShowDeleteModal(false);
		setDeleteError('');
	};

	const handleSearchInputChange = (e) => {
		setSearchQuery(e.target.value);
		if (!e.target.value.trim()) {
			setShowSearchResults(false);
		}
	};

	// const handleUserClick = (userId) => {
	// 	navigate(`/profile/${userId}`);
	// 	setShowSearchResults(false);
	// 	setSearchQuery('');
	// };

	return (
		<div className='top-bar-container z-50 fixed top-0 left-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex justify-between items-center p-4 w-full h-16'>
			<span className='top-bar-left'>
				<Link
					to='/home'
					className='text-2xl font-bold text-gray-800 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded transition-shadow duration-200'
					style={{ textShadow: '3px 3px 1px rgba(50,50,50,0.3)' }}
					aria-label='Go to home page'>
					LinkSpace
				</Link>
			</span>

			<span className='top-bar-center relative' ref={searchRef}>
				<span className='search-bar flex justify-start items-center bg-white rounded-full p-2 w-80 relative'>
					<SearchOutlinedIcon className='ml-2' />
					<input
						className='ml-2 bg-transparent outline-none flex-1'
						type='text'
						placeholder='Search'
						value={searchQuery}
						onChange={handleSearchInputChange}
						onFocus={() =>
							searchQuery && setShowSearchResults(true)
						}
					/>
					{searchLoading && (
						<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2'></div>
					)}
				</span>

				{/* Search Results Dropdown */}
				{showSearchResults && (
					<div className='absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-20'>
						{searchResults.length > 0 ? (
							<div className='py-2'>
								{searchResults.map((searchUser) => {
									return (
										<div
											key={searchUser._id}
											className='px-4 py-3 hover:bg-gray-50 flex items-center justify-between border-b last:border-b-0'>
											<div className='flex items-center gap-3 cursor-pointer flex-1 hover:bg-blue-50 transition-colors rounded-lg p-1'>
												<div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
													{searchUser.profile?.avatar
														?.url ? (
														<img
															src={
																searchUser
																	.profile
																	.avatar.url
															}
															alt={
																searchUser.displayName
															}
															className='w-10 h-10 rounded-full object-cover'
														/>
													) : (
														<PersonIcon className='text-blue-600' />
													)}
												</div>
												<div className='flex-1'>
													<div className='font-semibold text-gray-800 hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1'>
														{searchUser.displayName ||
															`${searchUser.profile?.firstName} ${searchUser.profile?.lastName}`}
													</div>
													<div className='text-sm text-gray-500 flex items-center gap-3'>
														{searchUser.profile
															?.address && (
															<span className='flex items-center gap-1'>
																<LocationOnIcon
																	style={{
																		fontSize:
																			'14px',
																	}}
																/>
																{
																	searchUser
																		.profile
																		.address
																}
															</span>
														)}
														{searchUser.createdAt && (
															<span className='flex items-center gap-1'>
																<CalendarTodayIcon
																	style={{
																		fontSize:
																			'14px',
																	}}
																/>
																{new Date(
																	searchUser.createdAt,
																).toLocaleDateString(
																	'en-US',
																)}
															</span>
														)}
													</div>
												</div>
											</div>

											<div className='flex items-center gap-2'>
												{isAlreadyFriend(
													searchUser._id,
												) ? (
													<span className='px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium'>
														Friends
													</span>
												) : hasPendingRequest(
														searchUser._id,
												  ) ||
												  friendRequests.has(
														searchUser._id,
												  ) ? (
													<span className='px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium'>
														Sent
													</span>
												) : friendRequestStatus[
														searchUser._id
												  ] === 'loading' ? (
													<button
														disabled
														className='px-3 py-1 bg-gray-400 text-white rounded-full flex items-center gap-1 text-sm cursor-not-allowed'>
														<div className='animate-spin rounded-full h-3 w-3 border-b-2 border-white'></div>
														Sending...
													</button>
												) : friendRequestStatus[
														searchUser._id
												  ] === 'success' ? (
													<span className='px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium'>
														Sent!
													</span>
												) : friendRequestStatus[
														searchUser._id
												  ] === 'error' ? (
													<button
														onClick={(e) => {
															e.stopPropagation();
															sendFriendRequest(
																searchUser._id,
															);
														}}
														className='px-3 py-1 bg-red-600 text-white rounded-full hover:bg-red-700 flex items-center gap-1 text-sm transition-colors'>
														<PersonAddIcon
															style={{
																fontSize:
																	'14px',
															}}
														/>
														Retry
													</button>
												) : searchUser._id ===
												  user?._id ? (
													<span className='px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm font-medium'>
														You
													</span>
												) : (
													<button
														onClick={(e) => {
															e.stopPropagation();
															sendFriendRequest(
																searchUser._id,
															);
														}}
														className='px-3 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 flex items-center gap-1 text-sm transition-colors'>
														<PersonAddIcon
															style={{
																fontSize:
																	'14px',
															}}
														/>
														Add Friend
													</button>
												)}
											</div>
										</div>
									);
								})}
							</div>
						) : (
							<div className='px-4 py-6 text-center text-gray-500'>
								<PersonIcon
									className='mx-auto mb-2 text-gray-300'
									style={{ fontSize: '32px' }}
								/>
								<p>No users found</p>
								<button
									onClick={() => {
										navigate('/search');
										setShowSearchResults(false);
										setSearchQuery('');
									}}
									className='mt-2 text-blue-600 hover:text-blue-800 text-sm'>
									Try advanced search
								</button>
							</div>
						)}
					</div>
				)}
			</span>

			<div className='top-bar-right flex justify-center items-center'>
				<span className='mr-3 font-bold text-gray-800 text-xl self-center'>
					{user?.profile?.firstName} {user?.profile?.lastName}
				</span>
				<ProfilePicture
					width={50}
					height={50}
					picture={user?.profile?.avatar?.url}
				/>
				<div ref={settingMenuRef}>
					<SettingsSuggestRoundedIcon
						className='mr-5 ml-5 hover:bg-white rounded-full hover:cursor-pointer transition'
						onClick={() => setShowSettingsMenu(!showSettingsMenu)}
					/>
					{showSettingsMenu && (
						<div className='absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[200px] z-10'>
							<button
								onClick={() => {
									setShowSettingsMenu(false);
									navigate('/profile', {
										state: { editMode: 'inline' },
									});
								}}
								className='w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2'>
								<span>Edit Profile</span>
							</button>
							<hr className='w-full border-gray-200' />
							<button
								onClick={() => {
									setShowSettingsMenu(false);
									navigate('/profile', {
										state: { editMode: 'settings' },
									});
								}}
								className='w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2'>
								<span>Privacy Settings</span>
							</button>
							<hr className='w-full border-gray-200' />
							<button
								className='w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600'
								onClick={() => setShowDeleteModal(true)}>
								<span>Delete Account</span>
							</button>
						</div>
					)}
				</div>
				{/* <NotificationsOutlinedIcon className='mr-5 hover:bg-white rounded-full hover:cursor-pointer transition' /> */}
				<FeedButton
					onClick={handleLogout}
					className='hover:bg-blue-100'
					style={{
						backgroundColor: 'white',
					}}>
					Logout
				</FeedButton>

				{showDeleteModal && (
					<DeleteAccountModal
						deleting={deleting}
						onCancel={handleCancelDelete}
						onDelete={handleDeleteAccount}
						error={deleteError}
					/>
				)}
			</div>
		</div>
	);
};

export default TopBar;
