'use client';

import { useState, useEffect } from 'react';
import api from '../lib/axios';
import GroupCard from './GroupCard';

const GroupSearch = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const [groups, setGroups] = useState([]);
	const [loading, setLoading] = useState(false);
	const [userGroups, setUserGroups] = useState([]);

	useEffect(() => {
		fetchUserGroups();
	}, []);

	const fetchUserGroups = async () => {
		try {
			const response = await api.get('/api/groups/user');
			setUserGroups(response.data.map((group) => group._id));
		} catch (error) {
			console.error('Error fetching user groups:', error);
		}
	};

	const searchGroups = async () => {
		if (!searchTerm.trim()) return;

		setLoading(true);
		try {
			const response = await api.get(
				`/api/groups/search?q=${searchTerm}`,
			);
			setGroups(response.data);
		} catch (error) {
			console.error('Error searching groups:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleJoinGroup = async (groupId) => {
		try {
			await api.post(`/api/groups/${groupId}/join`);
			setUserGroups([...userGroups, groupId]);
		} catch (error) {
			console.error('Error joining group:', error);
		}
	};

	const handleLeaveGroup = async (groupId) => {
		try {
			await api.post(`/api/groups/${groupId}/leave`);
			setUserGroups(userGroups.filter((id) => id !== groupId));
		} catch (error) {
			console.error('Error leaving group:', error);
		}
	};

	return (
		<div className='max-w-2xl mx-auto p-4'>
			<div className='mb-6'>
				<div className='flex gap-2'>
					<input
						type='text'
						placeholder='Search groups...'
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className='flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
						onKeyPress={(e) => e.key === 'Enter' && searchGroups()}
					/>
					<button
						onClick={searchGroups}
						disabled={loading}
						className='bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md disabled:opacity-50'>
						{loading ? 'Searching...' : 'Search'}
					</button>
				</div>
			</div>

			<div>
				{groups.map((group) => (
					<GroupCard
						key={group._id}
						group={group}
						onJoin={handleJoinGroup}
						onLeave={handleLeaveGroup}
						isJoined={userGroups.includes(group._id)}
					/>
				))}
			</div>
		</div>
	);
};

export default GroupSearch;
