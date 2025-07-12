import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import LocalPostOfficeOutlinedIcon from '@mui/icons-material/LocalPostOfficeOutlined';
import ProfilePicture from './ProfilePicture';
import FeedButton from './FeedButton';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';

const TopBar = ({ user }) => {
	const navigate = useNavigate();

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
			<span className='top-bar-right flex justify-center items-center'>
				<span className='mr-3 font-bold text-gray-800 text-xl self-center'>
					{user?.profile?.firstName} {user?.profile?.lastName}
				</span>
				<ProfilePicture
					width={50}
					height={50}
					picture='https://fastly.picsum.photos/id/58/1280/853.jpg?hmac=YO3QnOm9TpyM5DqsJjoM4CHg8oIq4cMWLpd9ALoP908'
				/>
				{/* <ProfilePicture picture={user?.profile.picture} /> */}
				<LocalPostOfficeOutlinedIcon className='mr-5 ml-5 hover:bg-white rounded-full hover:cursor-pointer transition' />
				<NotificationsOutlinedIcon className='mr-5 hover:bg-white rounded-full hover:cursor-pointer transition' />
				<FeedButton
					onClick={handleLogout}
					className='hover:bg-blue-100'
					style={{
						backgroundColor: 'white',
					}}>
					Logout
				</FeedButton>
			</span>
		</div>
	);
};

export default TopBar;
