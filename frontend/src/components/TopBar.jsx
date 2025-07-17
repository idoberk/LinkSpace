import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded';
import api from '../lib/axios';
import FeedButton from './FeedButton';
import ProfilePicture from './ProfilePicture';
import DeleteAccountModal from './DeleteAccount';
import { useUser } from '../hooks/useUser';

import { useLocation } from 'react-router-dom';

const TopBar = () => {
	const navigate = useNavigate();
	const { user, logout } = useUser();
	const [showSettingsMenu, setShowSettingsMenu] = useState(false);
	const settingMenuRef = useRef(null);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState('');
	const location = useLocation();
	const [searchText, setSearchText] = useState('');
	const isFeedOrProfile =
		location.pathname === '/home' ||
		location.pathname.startsWith('/profile');

	const handleLogout = async () => {
		try {
			await api.post('/account/logout');
		} catch (error) {
			console.error('Backend logout failed:', error);
		}

		logout();
		navigate('/login');
	};

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				settingMenuRef.current &&
				!settingMenuRef.current.contains(event.target)
			) {
				setShowSettingsMenu(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);
	const handleSearch = () => {
		if (isFeedOrProfile) {
			navigate(
				`${location.pathname}?search=${encodeURIComponent(searchText)}`,
			);
		}
	};

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
			<span className='top-bar-center'>
				<span className='search-bar flex justify-start items-center bg-white rounded-full p-2 w-80'>
					<SearchOutlinedIcon className='ml-2' />
					<input
						type='text'
						value={searchText}
						className='ml-2 bg-transparent outline-none'
						placeholder='Search post  by content'
						onChange={(e) => setSearchText(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter' && isFeedOrProfile)
								handleSearch();
						}}
					/>
				</span>
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
								className='w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2'></button>
							<hr className='w-full border-gray-200' />
							<button
								className='w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600'
								onClick={() => setShowDeleteModal(true)}>
								<span>Delete Account</span>
							</button>
						</div>
					)}
				</div>
				<FeedButton
					onClick={handleLogout}
					className='hover:bg-blue-300 bg-white'>
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
