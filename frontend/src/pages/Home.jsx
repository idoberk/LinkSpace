import FriendsDisplay from '../components/FriendsDisplay';
import FriendsRequest from '../components/FriendsRequest';
import Feed from '../components/Feed';
import { useUser } from '../hooks/useUser';

const Home = () => {
	const { user } = useUser();
	console.log({ user });
	return (
		<div className='flex flex-row h-full'>
			{/* Main feed */}
			<div className='w-3/5'>
				<Feed />
			</div>
			<div className='w-2/5 flex flex-col h-full overflow-y-auto'>
				<FriendsDisplay />
				<div className='mt-8 w-full max-w-xs bg-white border border-gray-300 rounded-xl shadow-lg p-4'>
					<FriendsRequest />
				</div>
			</div>
		</div>
	);
};

export default Home;
