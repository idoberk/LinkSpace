import SideBarItem from './SideBarItem';
import RoofingOutlinedIcon from '@mui/icons-material/RoofingOutlined';
import Diversity2OutlinedIcon from '@mui/icons-material/Diversity2Outlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import SupervisedUserCircleRoundedIcon from '@mui/icons-material/SupervisedUserCircleRounded';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import BarChartIcon from '@mui/icons-material/BarChart';

import { useNavigate } from 'react-router-dom';
import FriendsRequest from './FriendsRequest';
import { useUser } from '../hooks/useUser';

const SideBar = () => {
	const navigate = useNavigate();
	const { user } = useUser();
	return (
		<div className='flex flex-col h-screen'>
			<SideBarItem icon={<RoofingOutlinedIcon />} text='Feed' />
			<SideBarItem
				icon={<AssignmentIndIcon />}
				text='Profile'
				onClick={() => {
					navigate('/profile', { state: { user } });
				}}
			/>
			<SideBarItem
				icon={<Diversity2OutlinedIcon />}
				text='Groups'
				onClick={() => {
					navigate('/groups', { state: { user } });
				}}
			/>
			<SideBarItem
				icon={<SupervisedUserCircleRoundedIcon />}
				text='groupcard'
				onClick={() => {
					navigate('/create-group');
				}}
			/>
			<SideBarItem
				icon={<ChatBubbleOutlineOutlinedIcon />}
				text='Messages'
				onClick={() => {
					navigate('/messages', { state: { user } });
				}}
			/>
			<SideBarItem icon={<InsightsRoundedIcon />} text='Insights' />
			<SideBarItem
				icon={<BarChartIcon />}
				text='Statistics'
				onClick={() => {
					navigate('/statistics');
				}}
			/>

			{/* <div className='mt-8 w-1\5 max-w-xs bg-white border border-gray-300 rounded-xl shadow-lg p-4'>
				<FriendsRequest />
			</div> */}
		</div>
	);
};

export default SideBar;
