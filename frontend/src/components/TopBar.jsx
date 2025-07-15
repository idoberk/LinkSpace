import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { Link } from 'react-router-dom';

const TopBar = () => {
	return (
		<div className='top-bar-container bg-gradient-to-br from-blue-50 to-indigo-100 flex justify-between items-center p-4 w-full h-16'>
			<div className='top-bar-left'>
				<Link to="/home">
					<span
						className='text-2xl font-bold text-gray-800 mb-2'
						style={{
							textShadow: '3px 3px 1px rgba(50,50,50,0.3)',
						}}>
						LinkSpace
					</span>
				</Link>
			</div>
			<div className='top-bar-center'>
				<div className='search-bar flex justify-center items-center'>
					<SearchOutlinedIcon className='mr-2' />
					<input type='text' placeholder='Search' />
				</div>
			</div>
			<div className='top-bar-right'>
				<Link 
					to="/statistics" 
					className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
				>
					Statistics
				</Link>
			</div>
		</div>
	);
};

export default TopBar;
