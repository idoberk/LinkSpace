import FriendsDisplay from '../components/FriendsDisplay';
import GroupsDisplay from '../components/GroupsDisplay';
import SideBar from '../components/SideBar';
import Feed from '../components/Feed';
import { useUser } from '../hooks/useUser';

const Home = () => {
	const { user } = useUser();

	return (
		<div className='bg-white min-h-screen'>
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
					<GroupsDisplay />
				</div>
			</div>
		</div>
	);
};

export default Home;
