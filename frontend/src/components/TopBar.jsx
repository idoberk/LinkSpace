// import { useEffect, useRef, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';
// import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
// import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
// import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded';
// import api from '../lib/axios';
// import FeedButton from './FeedButton';
// import ProfilePicture from './ProfilePicture';
// import DeleteAccountModal from './DeleteAccount';
// import { useUser } from '../hooks/useUser';

// // TODO: add a on click to the settings page
// // TODO: check that the delete account modal is working and delete the account from DB

// const TopBar = () => {
// 	const navigate = useNavigate();
// 	const { user, logout } = useUser();
// 	const [showSettingsMenu, setShowSettingsMenu] = useState(false);
// 	const settingMenuRef = useRef(null);
// 	const [showDeleteModal, setShowDeleteModal] = useState(false);
// 	const [deleting, setDeleting] = useState(false);
// 	const [deleteError, setDeleteError] = useState('');

// 	const handleLogout = async () => {
// 		try {
// 			await api.post('/account/logout');
// 		} catch (error) {
// 			console.error('Backend logout failed:', error);
// 		}

// 		logout();
// 		navigate('/login');
// 	};

// 	// Close menu when clicking outside
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

// 	const handleDeleteAccount = async (password) => {
// 		setDeleteError('');
// 		try {
// 			setDeleting(true);
// 			await api.delete('/account/', {
// 				data: { password },
// 			});
// 			alert('Your account has been deleted');
// 			setShowDeleteModal(false); // Only close on success
// 			logout();
// 			navigate('/login');
// 		} catch (err) {
// 			console.error('Error deleting account:', err);
// 			setDeleteError(
// 				err?.response?.data?.errors?.message ||
// 					'Failed to delete account',
// 			);
// 			// Do NOT close the modal on error
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
// 						className='ml-2 bg-transparent outline-none'
// 						type='text'
// 						placeholder='Search'
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
// 					{/* <ProfilePicture picture={user?.profile.picture} /> */}
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
// 								className='w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2'>
// 								<span>Privacy Settings</span>
// 							</button>
// 							<hr className='w-full border-gray-200' />
// 							<button
// 								className='w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600'
// 								onClick={() => setShowDeleteModal(true)}>
// 								<span>Delete Account</span>
// 							</button>
// 						</div>
// 					)}
// 				</div>
// 				<NotificationsOutlinedIcon className='mr-5 hover:bg-white rounded-full hover:cursor-pointer transition' />
// 				<FeedButton
// 					onClick={handleLogout}
// 					className='hover:bg-blue-100'
// 					style={{
// 						backgroundColor: 'white',
// 					}}>
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

// import { useState, useRef, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
// import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
// import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded';
// import api from '../lib/axios';
// import FeedButton from './FeedButton';
// import ProfilePicture from './ProfilePicture';
// import DeleteAccountModal from './DeleteAccount';
// import SearchModal from './SearchModal';
// import { useUser } from '../hooks/useUser';

// const TopBar = () => {
// 	const navigate = useNavigate();
// 	const { user, logout } = useUser();
// 	const [showSettingsMenu, setShowSettingsMenu] = useState(false);
// 	const settingMenuRef = useRef(null);
// 	const [showDeleteModal, setShowDeleteModal] = useState(false);
// 	const [deleting, setDeleting] = useState(false);
// 	const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
// 	const [deleteError, setDeleteError] = useState('');

// 	// Close menu on outside click
// 	useEffect(() => {
// 		const handleClickOutside = (e) => {
// 			if (
// 				settingMenuRef.current &&
// 				!settingMenuRef.current.contains(e.target)
// 			) {
// 				setShowSettingsMenu(false);
// 			}
// 		};
// 		document.addEventListener('mousedown', handleClickOutside);
// 		return () =>
// 			document.removeEventListener('mousedown', handleClickOutside);
// 	}, []);

// 	const handleLogout = async () => {
// 		try {
// 			await api.post('/account/logout');
// 		} catch (err) {
// 			console.error('Backend logout failed:', err);
// 		}
// 		logout();
// 		navigate('/login');
// 	};

// 	const handleDeleteAccount = async (password) => {
// 		setDeleteError('');
// 		try {
// 			setDeleting(true);
// 			await api.delete('/account/', { data: { password } });
// 			alert('Your account has been deleted');
// 			setShowDeleteModal(false);
// 			logout();
// 			navigate('/login');
// 		} catch (err) {
// 			console.error('Delete error:', err);
// 			setDeleteError(
// 				err?.response?.data?.errors?.message ||
// 					'Failed to delete account',
// 			);
// 		} finally {
// 			setDeleting(false);
// 		}
// 	};

// 	return (
// 		<div className='top-bar-container z-50 fixed top-0 left-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex justify-between items-center p-4 w-full h-16'>
// 			<span className='top-bar-left'>
// 				<Link
// 					to='/home'
// 					className='text-2xl font-bold text-gray-800 mb-2'
// 					style={{ textShadow: '3px 3px 1px rgba(50,50,50,0.3)' }}>
// 					LinkSpace
// 				</Link>
// 			</span>

// 			<span className='top-bar-center'>
// 				<span
// 					className='search-bar flex justify-start items-center bg-white rounded-full p-2 w-80 cursor-pointer'
// 					onClick={() => setIsSearchModalOpen(true)}>
// 					<SearchOutlinedIcon className='ml-2' />
// 					<span className='ml-2 text-gray-500'>Search users...</span>
// 				</span>
// 			</span>

// 			<div className='top-bar-right flex justify-center items-center gap-4'>
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
// 						className='mr-5 ml-5 hover:bg-white rounded-full cursor-pointer transition'
// 						onClick={() => setShowSettingsMenu(!showSettingsMenu)}
// 					/>
// 					{showSettingsMenu && (
// 						<div className='absolute top-full right-0 mt-2 bg-white border rounded-lg shadow-lg py-2 min-w-[200px]'>
// 							<button
// 								onClick={() => {
// 									setShowSettingsMenu(false);
// 									navigate('/profile', {
// 										state: { editMode: 'inline' },
// 									});
// 								}}
// 								className='w-full px-4 py-2 text-left hover:bg-gray-50'>
// 								Edit Profile
// 							</button>
// 							<button
// 								onClick={() => {
// 									setShowSettingsMenu(false);
// 									navigate('/profile', {
// 										state: { editMode: 'settings' },
// 									});
// 								}}
// 								className='w-full px-4 py-2 text-left hover:bg-gray-50'>
// 								Privacy Settings
// 							</button>
// 							<button
// 								onClick={() => setShowDeleteModal(true)}
// 								className='w-full px-4 py-2 text-left hover:bg-gray-50 text-red-600'>
// 								Delete Account
// 							</button>
// 						</div>
// 					)}
// 				</div>
// 				<NotificationsOutlinedIcon className='mr-5 hover:bg-white rounded-full cursor-pointer transition' />
// 				<FeedButton
// 					onClick={handleLogout}
// 					className='hover:bg-blue-100'
// 					style={{ backgroundColor: 'white' }}>
// 					Logout
// 				</FeedButton>
// 			</div>

// 			<SearchModal
// 				isOpen={isSearchModalOpen}
// 				onClose={() => setIsSearchModalOpen(false)}
// 			/>

// 			{showDeleteModal && (
// 				<DeleteAccountModal
// 					deleting={deleting}
// 					onCancel={() => {
// 						setShowDeleteModal(false);
// 						setDeleteError('');
// 					}}
// 					onDelete={handleDeleteAccount}
// 					error={deleteError}
// 				/>
// 			)}
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
import api from '../lib/axios';
import FeedButton from './FeedButton';
import ProfilePicture from './ProfilePicture';
import DeleteAccountModal from './DeleteAccount';
import { useUser } from '../hooks/useUser';

const TopBar = () => {
	const navigate = useNavigate();
	const { user, logout } = useUser();
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

	// Send friend request
	const sendFriendRequest = async (userId) => {
		try {
			await api.post(`/users/${userId}/friend-request`);
			setFriendRequests((prev) => new Set(prev).add(userId));
		} catch (error) {
			console.error('Error sending friend request:', error);
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

	const handleUserClick = (userId) => {
		navigate(`/profile/${userId}`);
		setShowSearchResults(false);
		setSearchQuery('');
	};

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
						placeholder='Search users...'
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
								{searchResults.map((searchUser) => (
									<div
										key={searchUser._id}
										className='px-4 py-3 hover:bg-gray-50 flex items-center justify-between border-b last:border-b-0'>
										<div
											className='flex items-center gap-3 cursor-pointer flex-1'
											onClick={() =>
												handleUserClick(searchUser._id)
											}>
											<div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
												{searchUser.profile?.avatar ? (
													<img
														src={
															searchUser.profile
																.avatar
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
												<div className='font-semibold text-gray-800'>
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
											{friendRequests.has(
												searchUser._id,
											) ? (
												<span className='px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium'>
													Sent
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
															fontSize: '14px',
														}}
													/>
													Add
												</button>
											)}
										</div>
									</div>
								))}

								{/* Link to advanced search */}
								<div className='px-4 py-3 border-t'>
									<button
										onClick={() => {
											navigate('/search');
											setShowSearchResults(false);
											setSearchQuery('');
										}}
										className='w-full text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center justify-center gap-2'>
										<SearchOutlinedIcon
											style={{ fontSize: '16px' }}
										/>
										Advanced Search
									</button>
								</div>
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
				<NotificationsOutlinedIcon className='mr-5 hover:bg-white rounded-full hover:cursor-pointer transition' />
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
