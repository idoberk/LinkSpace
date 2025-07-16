import TopBar from './TopBar';
import { Outlet } from 'react-router-dom';

const ProtectedLayout = () => (
	<div className='bg-white min-h-screen'>
		<TopBar />
		<div className='pt-16'>
			<Outlet />
		</div>
	</div>
);

export default ProtectedLayout;
