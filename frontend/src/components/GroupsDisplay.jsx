import FeedButton from './FeedButton';
import TopBar from './TopBar';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import api from '../lib/axios';
import CreateGroup from './CreateGroup';

const GroupsDisplay = () => {
	const navigate = useNavigate();
	const user = JSON.parse(localStorage.getItem('user'));
	const myGroups = user?.groups || [];
	// const location = useLocation();

	const [filters, setFilters] = useState({
		name: '',
		category: '',
		createdAfter: '',
		createdBefore: '',
		privacy: '',
	});
	const [groups, setGroups] = useState([]);
	const [loading, setLoading] = useState(false);

	const handleFilterChange = (e) => {
		setFilters({ ...filters, [e.target.name]: e.target.value });
	};
	const handleReset = () => {
		setFilters({
			name: '',
			category: '',
			createdAfter: '',
			createdBefore: '',
			privacy: '',
		});
		setGroups([]);
	};

	const handleSearch = async (e) => {
		e.preventDefault();
		if (
			!filters.name &&
			!filters.category &&
			!filters.privacy &&
			!filters.createdAfter &&
			!filters.createdBefore
		) {
			handleReset();
			return;
		}
		setLoading(true);
		setGroups([]);
		const params = {};
		for (const key in filters) {
			if (filters[key]) {
				params[key] = filters[key];
			}
		}
		console.log(params);
		try {
			const response = await api.get('/groups', { params });
			setGroups(response.data.groups);
			console.log(groups);
		} catch (error) {
			console.error('Error searching groups:', error);
		} finally {
			setLoading(false);
		}
	};
	// const handleCreateGroup = () =>{
	//     <CreateGroup onGroupCreate()

	// }
	// useEffect(() => {
	// 	if (location.state?.refresh) {
	// 		handleSearch();
	// 		navigate(location.pathname, { replace: true });
	// 	}
	// }, [location, navigate]);

	return (
		<div className='min-h-screen'>
			<TopBar user={user} />

			<div className='flex flex-row w-full mt-10'>
				<div className='left-side w-1/2 p-8 ml-2'>
					<h1 className='text-4xl font-bold text-gray-500'>Groups</h1>
					<FeedButton
						className='h-15 w-70 mt-6'
						onClick={() => navigate('/create-group')}>
						Create New Group
					</FeedButton>
					<div className='w-full ml-2'>
						<h2 className='text-3xl font-bold text-gray-500 mt-2 ml-4'>
							My Groups
						</h2>
						{myGroups.length === 0 ? (
							<div>No groups found.</div>
						) : (
							myGroups.map((group) => (
								<div key={group._id}>{group.name}</div>
							))
						)}
					</div>
				</div>

				<div className='right-side w-1/2 p-8'>
					<div className='flex flex-col mt-10 ml-2'>
						<form className='mt-2' onSubmit={handleSearch}>
							<span className='search-bar flex justify-start items-center bg-white rounded-full p-2 w-80 border border-gray-500 mb-2'>
								<SearchOutlinedIcon className='ml-2 text-gray-500 text-5xl' />
								<input
									className='ml-2 outline-none text-gray-500 text-xl'
									type='text'
									placeholder='Search groups by name'
									name='name'
									value={filters.name}
									onChange={handleFilterChange}
								/>
							</span>

							<select
								name='category'
								value={filters.category}
								onChange={handleFilterChange}
								className='border border-gray-500 rounded-md p-3 w-80 mb-2 mt-1'>
								<option value='Technology'>Technology</option>
								<option value='Sports'>Sports</option>
								<option value='Music'>Music</option>
								<option value='Art'>Art</option>
								<option value='Gaming'>Gaming</option>
								<option value='Education'>Education</option>
								<option value='Travel'>Travel</option>
								<option value='Food'>Food</option>
								<option value='Health'>Health</option>
								<option value='Other'>Other</option>
							</select>

							<div className='flex gap-2 w-80 mt-2 flex-col'>
								<label className='text-gray-500 text-md'>
									Created after
									<input
										type='date'
										name='createdAfter'
										value={filters.createdAfter}
										onChange={handleFilterChange}
										className='border border-gray-500 rounded-md p-2 flex-1 mt-1 ml-5.5'
									/>
								</label>
								<label className='text-gray-500 text-md mt-2 '>
									Created before
									<input
										type='date'
										name='createdBefore'
										value={filters.createdBefore}
										onChange={handleFilterChange}
										className='border border-gray-500 rounded-md p-2 flex-1 mt-1 ml-2'
									/>
								</label>
							</div>
							<FeedButton type='submit' className='mt-4 w-36'>
								Search
							</FeedButton>
							<FeedButton
								onClick={handleReset}
								className='mt-4 w-36 ml-2'>
								Reset search
							</FeedButton>
						</form>
						<div className='mt-4'>
							<h2 className='text-3xl font-bold text-gray-500'>
								Search Results
							</h2>
							{/* <div className='mt-4'>
								{groups.map((group) => (
									<div key={group._id}>{group.name}</div>
								))}
							</div> */}
							<div className='mt-4 grid grid-cols-1 gap-4'>
								{/* {groups.length === 0 ? (
									<div className='text-gray-400'>
										No groups found.
									</div>
								) : (
									groups.map((group) => (
										<div key={group._id}>
											<h1>{group.name}</h1>
										</div>
									))
								)} */}
								{loading ? (
									<div className='text-gray-400'>
										Loading...
									</div>
								) : groups.length === 0 ? (
									<div className='text-gray-400'>
										No groups found.
									</div>
								) : (
									groups.map((group) => (
										<div key={group._id}>
											<h1>{group.name}</h1>
										</div>
									))
								)}
							</div>
						</div>
					</div>
				</div>
			</div>

			<FeedButton
				className='fixed bottom-6 right-4 z-50'
				onClick={() => navigate('/home')}>
				Return to Home Page
			</FeedButton>
		</div>
	);
};

export default GroupsDisplay;
