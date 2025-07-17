import { useState } from 'react';
import Input from './Input';
import api from '../lib/axios';
import FeedButton from './FeedButton';
import GroupCard from './GroupCard';
import { useUser } from '../hooks/useUser';

const GroupSearch = () => {
	const { user, setUser } = useUser();
	const [searchParams, setSearchParams] = useState({
		name: '',
		category: '',
		privacy: '',
		minMembers: '',
	});
	const [loading, setLoading] = useState(false);
	const [results, setResults] = useState([]);

	const categories = [
		'',
		'technology',
		'sports',
		'music',
		'gaming',
		'education',
		'business',
		'art',
		'health',
		'food',
		'travel',
		'photography',
		'books',
		'movies',
		'politics',
		'science',
		'other',
	];

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setSearchParams((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		// Filter out empty values
		const filteredParams = Object.entries(searchParams).reduce(
			(acc, [key, value]) => {
				if (value.trim() !== '') {
					acc[key] = value;
				}
				return acc;
			},
			{},
		);

		try {
			setLoading(true);
			const res = await api.get('/groups', { params: filteredParams });
			setResults(res.data.groups);
		} catch (error) {
			console.error(
				'Group fetch error:',
				error.response?.data || error.message,
			);
			setResults([]);
		} finally {
			setLoading(false);
		}
	};

	const handleReset = () => {
		setSearchParams({
			name: '',
			category: '',
			privacy: '',
			minMembers: '',
		});
		setResults([]);
	};

	const handleJoin = async (groupId) => {
		try {
			await api.post(`/groups/${groupId}/join`);
			setUser((prevUser) => ({
				...prevUser,
				groups: [...prevUser.groups, groupId],
			}));

			setResults((prevResults) =>
				prevResults.map((group) =>
					group._id === groupId
						? {
								...group,
								members: [
									...(group.members || []),
									{ user: user._id },
								],
						  }
						: group,
				),
			);
		} catch (error) {
			console.error(
				'Error joining group:',
				error.response?.data || error.message,
			);
		}
	};

	const handleLeave = async (groupId) => {
		try {
			await api.post(`/groups/${groupId}/leave`);
			setUser((prevUser) => ({
				...prevUser,
				groups: prevUser.groups.filter((id) => id !== groupId),
			}));

			setResults((prevResults) =>
				prevResults.map((group) =>
					group._id === groupId
						? {
								...group,
								members: (group.members || []).filter(
									(member) =>
										String(member.user) !==
										String(user._id),
								),
						  }
						: group,
				),
			);
		} catch (error) {
			console.error(
				'Error leaving group:',
				error.response?.data || error.message,
			);
		}
	};

	return (
		<div className='bg-white rounded-lg shadow-md p-4 mb-6'>
			<h3 className='text-lg font-semibold text-gray-800 mb-4'>
				Search Groups
			</h3>

			<form onSubmit={handleSubmit} className='space-y-4'>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<Input
						label='Group Name'
						id='name'
						name='name'
						type='text'
						value={searchParams.name}
						onChange={handleInputChange}
						placeholder='Search by name...'
						labelStyle='block text-sm font-medium text-gray-700 mb-1'
						inputStyle='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
					/>

					<div>
						<label
							htmlFor='category'
							className='block text-sm font-medium text-gray-700 mb-1'>
							Category
						</label>
						<select
							id='category'
							name='category'
							value={searchParams.category}
							onChange={handleInputChange}
							className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'>
							<option value=''>All Categories</option>
							{categories.slice(1).map((cat) => (
								<option key={cat} value={cat}>
									{cat.charAt(0).toUpperCase() + cat.slice(1)}
								</option>
							))}
						</select>
					</div>

					<div>
						<label
							htmlFor='privacy'
							className='block text-sm font-medium text-gray-700 mb-1'>
							Privacy
						</label>
						<select
							id='privacy'
							name='privacy'
							value={searchParams.privacy}
							onChange={handleInputChange}
							className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'>
							<option value=''>All</option>
							<option value='public'>Public</option>
							<option value='private'>Private</option>
						</select>
					</div>
				</div>

				<div className='flex gap-2'>
					<FeedButton type='submit' disabled={loading}>
						{loading ? 'Searching...' : 'Search'}
					</FeedButton>
					<FeedButton
						type='button'
						onClick={handleReset}
						className='px-4 py-2 border border-gray-300  text-gray-600 hover:bg-gray-50'>
						Reset
					</FeedButton>
				</div>
			</form>
			{results.length > 0 && (
				<div className='mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
					{results.map((group) => {
						const isJoined = user.groups?.some(
							(id) => String(id) === String(group._id),
						);
						return (
							<GroupCard
								key={group._id}
								group={group}
								isJoined={isJoined}
								onJoin={handleJoin}
								onLeave={handleLeave}
								showEdit={false}
								showLeave={false}
								showJoin={true}
							/>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default GroupSearch;
