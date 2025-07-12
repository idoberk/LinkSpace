import TopBar from '../components/TopBar';
import SideBar from '../components/SideBar';
import Feed from '../components/Feed';
import { useState } from 'react';

// TODO: change the profile picture to the user's avatar picture from backend
const Home = () => {
	const [user, setUser] = useState(() => {
		const storedUser = localStorage.getItem('user');
		return storedUser ? JSON.parse(storedUser) : null;
	});

	console.log(user);

	return (
		<div className='bg-white min-h-screen'>
			<TopBar user={user} />
			<div className='flex flex-row h-screen mt-16'>
				<div className='w-1/5 h-screen'>
					<SideBar className='h-screen ' user={user} />
				</div>
				<div className='w-3/5 h-screen'>
					<Feed className='h-screen ' />
				</div>
			</div>
		</div>
	);
};

export default Home;
