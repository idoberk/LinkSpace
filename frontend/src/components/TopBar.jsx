import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded';
import api from '../lib/axios';
import FeedButton from './FeedButton';
import ProfilePicture from './ProfilePicture';
import DeleteAccountModal from './DeleteAccount';
 
import SearchModal from './SearchModal';
import { useUser } from '../hooks/useUser';

// TODO: add a on click to the settings page
// TODO: check that the delete account modal is working and delete the account from DB

const TopBar = () => {
	const navigate = useNavigate();
	const { user, logout } = useUser();
	const [showSettingsMenu, setShowSettingsMenu] = useState(false);
	const settingMenuRef = useRef(null);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
	const [searchResults, setSearchResults] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [isSearching, setIsSearching] = useState(false);
	const searchTimeoutRef = useRef(null);

	const [deleteError, setDeleteError] = useState('');

	const handleLogout = async () => {
		try {
			await api.post('/account/logout');
		} catch (error) {
			console.error('Backend logout failed:', error);
		}

		logout();
		navigate('/login');
	};

	// Close menu when clicking outside
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

	const handleDeleteAccount = async (password) => {
		setDeleteError('');
		try {
			setDeleting(true);
			await api.delete('/account/', {
				data: { password },
			});
			alert('Your account has been deleted');
			setShowDeleteModal(false); // Only close on success
			logout();
			navigate('/login');
		} catch (err) {
			console.error('Error deleting account:', err);
			setDeleteError(
				err?.response?.data?.errors?.message ||
					'Failed to delete account',
			);
			// Do NOT close the modal on error
		} finally {
			setDeleting(false);
		}
	};

	const handleSearch = async (query) => {
		if (!query.trim()) {
			setSearchResults([]);
			return;
		}

		try {
			setIsSearching(true);
			// Use firstName parameter for the main search input to support incremental search
			const response = await api.get(`/api/users/search?firstName=${encodeURIComponent(query.trim())}`);
			setSearchResults(response.data.users || []);
		} catch (error) {
			console.error('Search error:', error);
			setSearchResults([]);
		} finally {
			setIsSearching(false);
		}
	};

	const handleSearchInputChange = (e) => {
		const query = e.target.value;
		setSearchQuery(query);
		
		// Clear previous timeout
		if (searchTimeoutRef.current) {
			clearTimeout(searchTimeoutRef.current);
		}
		
		// If query is empty, clear results immediately
		if (!query.trim()) {
			setSearchResults([]);
			return;
		}
		
		// Set new timeout for debounced search
		searchTimeoutRef.current = setTimeout(() => {
			handleSearch(query);
		}, 200); // Reduced delay for more responsive incremental search
	}
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
						className='ml-2 bg-transparent outline-none cursor-pointer'
						type='text'
						placeholder='Search users...'
						onClick={() => setIsSearchModalOpen(true)}
						readOnly
						value={searchQuery}
						onChange={handleSearchInputChange}
					/>
				</span>
			</span>
			<div className='top-bar-right flex justify-center items-center gap-4'>
				<span className='mr-3 font-bold text-gray-800 text-xl self-center'>
					{user?.profile?.firstName} {user?.profile?.lastName}
				</span>
				<ProfilePicture
					width={50}
					height={50}
					picture={user?.profile?.avatar?.url}
				/>
				<div ref={settingMenuRef}>
					{/* <ProfilePicture picture={user?.profile.picture} /> */}
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
				<Link
					to='/statistics'
					className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'>
					Statistics
				</Link>

				{showDeleteModal && (
					<DeleteAccountModal
						deleting={deleting}
						onCancel={handleCancelDelete}
						onDelete={handleDeleteAccount}
						error={deleteError}
					/>
				)}
			</div>
{/* 			
			<SearchModal 
				isOpen={isSearchModalOpen} 
				onClose={() => setIsSearchModalOpen(false)} 
				searchResults={searchResults}
				isSearching={isSearching}
			/> */}

		</div>
	);
};

export default TopBar;
