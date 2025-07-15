import FriendsDisplay from '../components/FriendsDisplay';
import GroupsDisplay from '../components/GroupsDisplay';
import TopBar from '../components/TopBar';
import SideBar from '../components/SideBar';
import Feed from '../components/Feed';
import { useState } from 'react';
import FriendsRequest from '../components/FriendsRequest';

const Home = () => {
	const [user] = useState(() => {
		const storedUser = localStorage.getItem('user');
		return storedUser ? JSON.parse(storedUser) : null;
	});

	console.log(user);

	return (
		<div className='bg-white min-h-screen'>
			<TopBar user={user} />

			<div className='flex flex-row h-[calc(100vh-4rem)] mt-16'>
				{/* Left sidebar */}
				<div className='w-1/5 flex flex-col h-full overflow-y-auto'>
					<SideBar user={user} />
					{/* <FriendsRequest /> */}
				</div>

				{/* Main feed */}
				<div className='w-3/5'>
					<Feed />
				</div>
				<div className='w-1/5 flex flex-col h-full overflow-y-auto'>
					<FriendsDisplay />
				</div>
			</div>
		</div>
	);
};

export default Home;
