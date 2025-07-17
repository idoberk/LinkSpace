import FriendsDisplay from '../components/FriendsDisplay';
import FriendsRequest from '../components/FriendsRequest';
import SideBar from '../components/SideBar';
import Feed from '../components/Feed';
import { useUser } from '../hooks/useUser';

const Home = () => {
	const { user } = useUser();
	console.log({ user });
	return (
		<div className='bg-white min-h-screen'>
			<div className='flex flex-row h-[calc(100vh-4rem)] mt-16'>
				{/* Left sidebar */}
				<div className='w-1/5 flex flex-col h-full overflow-y-auto'>
					<SideBar user={user} />
				</div>

				{/* Main feed */}
				<div className='w-3/5'>
					<Feed />
				</div>
				<div className='w-1/5 flex flex-col h-full overflow-y-auto'>
					<FriendsDisplay />
					<div className='mt-8 w-1\5 max-w-xs bg-white border border-gray-300 rounded-xl shadow-lg p-4'>
						<FriendsRequest />
					</div>
				</div>
			</div>
		</div>
	);
};

export default Home;
