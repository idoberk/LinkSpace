import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded';
import ProfilePicture from './ProfilePicture';
import FeedButton from './FeedButton';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import { useState, useEffect, useRef } from 'react';
import DeleteAccountModal from './DeleteAccount';

// TODO: add a on click to the settings page
// TODO: check that the delete account modal is working and delete the account from DB

const TopBar = ({ user }) => {
	const navigate = useNavigate();
	const [showSettingsMenu, setShowSettingsMenu] = useState(false);
	const settingMenuRef = useRef(null);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deletePassword, setDeletePassword] = useState('');
	const [deleting, setDeleting] = useState(false);

	const handleLogout = async () => {
		try {
			await api.post('/account/logout');
			console.log('Backend logout successful');
		} catch (error) {
			console.error('Backend logout failed:', error);
		}

		// Clear frontend storage
		localStorage.removeItem('token');
		localStorage.removeItem('user');
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

	const handleDeleteAccount = async () => {
		try {
			setDeleting(true);
			await api.post('/account/delete', { password: deletePassword });
			alert('Your account has been deleted');
			navigate('/login');
		} catch (err) {
			console.error('Error deleting account:', err);
			alert(
				err?.response?.data?.errors?.message ||
					'Failed to delete account',
			);
		} finally {
			setDeleting(false);
			setShowDeleteModal(false);
		}
	};

	return (
		<div className='top-bar-container z-50 fixed top-0 left-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex justify-between items-center p-4 w-full h-16'>
			<span className='top-bar-left'>
				<span
					className='text-2xl font-bold text-gray-800 mb-2'
					style={{
						textShadow: '3px 3px 1px rgba(50,50,50,0.3)',
					}}>
					LinkSpace
				</span>
			</span>
			<span className='top-bar-center'>
				<span className='search-bar flex justify-start items-center bg-white rounded-full p-2 w-80'>
					<SearchOutlinedIcon className='ml-2' />
					<input
						className='ml-2 bg-transparent outline-none'
						type='text'
						placeholder='Search'
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
					picture={user?.profile?.avatar}
				/>
				<div ref={settingMenuRef}>
					{/* <ProfilePicture picture={user?.profile.picture} /> */}
					<SettingsSuggestRoundedIcon
						className='mr-5 ml-5 hover:bg-white rounded-full hover:cursor-pointer transition'
						onClick={() => setShowSettingsMenu(!showSettingsMenu)}
					/>
					{showSettingsMenu && (
						<div className='absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[200px] z-10'>
							<button className='w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2'>
								<span>Edit Profile</span>
							</button>
							<hr className='w-full border-gray-200' />
							<button className='w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2'>
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
						password={deletePassword}
						setPassword={setDeletePassword}
						deleting={deleting}
						onCancel={() => setShowDeleteModal(false)}
						onDelete={handleDeleteAccount}
					/>
				)}
			</div>
			<div className='top-bar-right'>
				<Link
					to='/statistics'
					className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'>
					Statistics
				</Link>
			</div>
		</div>
	);
};

export default TopBar;
