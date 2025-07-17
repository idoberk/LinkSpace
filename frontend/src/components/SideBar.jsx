import SideBarItem from './SideBarItem';
import Diversity2OutlinedIcon from '@mui/icons-material/Diversity2Outlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import SupervisedUserCircleRoundedIcon from '@mui/icons-material/SupervisedUserCircleRounded';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';

import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';

const SideBar = () => {
	const navigate = useNavigate();
	const { user } = useUser();
	return (
		<div className='flex flex-col h-screen'>
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
				text='Find Users'
				onClick={() => navigate('/users')}
			/>
			<SideBarItem
				icon={<ChatBubbleOutlineOutlinedIcon />}
				text='Messages'
				onClick={() => {
					navigate('/messages', { state: { user } });
				}}
			/>
			<SideBarItem
				text='Canvas'
				onClick={() => {
					navigate('/canvas');
				}}
			/>
			<SideBarItem
				icon={<InsightsRoundedIcon />}
				text='Insights'
				onClick={() => navigate('/statistics')}
			/>
		</div>
	);
};

export default SideBar;
