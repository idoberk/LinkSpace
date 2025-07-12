import SideBarItem from './SideBarItem';
import RoofingOutlinedIcon from '@mui/icons-material/RoofingOutlined';
import Diversity2OutlinedIcon from '@mui/icons-material/Diversity2Outlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import SupervisedUserCircleRoundedIcon from '@mui/icons-material/SupervisedUserCircleRounded';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import { useNavigate } from 'react-router-dom';

const SideBar = ({ user }) => {
	const navigate = useNavigate();
	return (
		<div className=' fixed left-0 flex-col h-screen'>
			<SideBarItem icon={<RoofingOutlinedIcon />} text='Feed' />
			<SideBarItem
				icon={<AssignmentIndIcon />}
				text='Profile'
				onClick={() => {
					navigate('/profile', { state: { user } });
				}}
			/>
			<SideBarItem icon={<Diversity2OutlinedIcon />} text='Groups' />

			<SideBarItem
				icon={<SupervisedUserCircleRoundedIcon />}
				text='Friends'
			/>
			<SideBarItem
				icon={<ChatBubbleOutlineOutlinedIcon />}
				text='Messages'
			/>
			<SideBarItem icon={<InsightsRoundedIcon />} text='Insights' />
		</div>
	);
};

export default SideBar;
