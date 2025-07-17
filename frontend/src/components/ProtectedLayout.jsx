import TopBar from './TopBar';
import SideBar from './SideBar';
import { Outlet } from 'react-router-dom';

const ProtectedLayout = () => (
	<div className='bg-white min-h-screen'>
		<TopBar />
		<div className='pt-16'>
			<div className='flex flex-row h-[calc(100vh-4rem)]'>
				{/* Left sidebar */}
				<div className='w-1/5 flex flex-col h-full overflow-y-auto'>
					<SideBar />
				</div>

				{/* Main content */}
				<div className='w-4/5'>
					<Outlet />
				</div>
			</div>
		</div>
	</div>
);

export default ProtectedLayout;
