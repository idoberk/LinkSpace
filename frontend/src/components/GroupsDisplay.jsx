import FeedButton from './FeedButton';
import TopBar from './TopBar';
import { useNavigate } from 'react-router-dom';

const GroupsDisplay = () => {
	const navigate = useNavigate();
	const user = JSON.parse(localStorage.getItem('user'));

	return (
		<div className=' min-h-screen'>
			<TopBar user={user} />
			<div className='flex flex-col items-center justify-center mt-20'>
				<h1 className='text-5xl font-bold text-gray-500'>Groups</h1>
				<FeedButton
					className=' h-15 w-70 mt-10'
					onClick={() => navigate('/create-group')}>
					Create New Group
				</FeedButton>
				<div className=' w-full'>
					<h2 className='text-3xl font-bold text-gray-500 '>
						My Groups
					</h2>
				</div>
			</div>
			<FeedButton
				className='fixed bottom-6 right-4 z-50'
				onClick={() => navigate('/home')}>
				Return to Home Page
			</FeedButton>
		</div>
	);
};

export default GroupsDisplay;
