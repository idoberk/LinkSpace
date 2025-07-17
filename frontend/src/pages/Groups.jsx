// 'use client';

// import { useState, useEffect } from 'react';
// import api from '../lib/axios';
// import GroupCard from '../components/GroupCard';
// import GroupSearch from '../components/GroupSearch';

// const Groups = () => {
// 	const [activeTab, setActiveTab] = useState('my-groups');
//  const [myGroups, setMyGroups] = useState([])
// 	const [loading, setLoading] = useState(false);

// 	// useEffect(() => {
// 	//   if (activeTab === "my-groups") {
// 	//     fetchMyGroups()
// 	//   }
// 	// }, [activeTab])

// 	// const fetchMyGroups = async () => {
// 	//   setLoading(true)
// 	//   try {
// 	//     const response = await api.get("/api/groups/user")
// 	//     setMyGroups(response.data)
// 	//   } catch (error) {
// 	//     console.error("Error fetching groups:", error)
// 	//   } finally {
// 	//     setLoading(false)
// 	//   }
// 	// }

// 	const handleLeaveGroup = async (groupId) => {
// 		try {
// 			await api.post(`/api/groups/${groupId}/leave`);
// 			setMyGroups(myGroups.filter((group) => group._id !== groupId));
// 		} catch (error) {
// 			console.error('Error leaving group:', error);
// 		}
// 	};

// 	return (
// 		<div className='max-w-4xl mx-auto p-4'>
// 			<h1 className='text-3xl font-bold mb-6'>Groups</h1>

// 			{/* Tabs */}
// 			<div className='flex border-b mb-6'>
// 				<button
// 					onClick={() => setActiveTab('my-groups')}
// 					className={`px-4 py-2 font-medium ${
// 						activeTab === 'my-groups'
// 							? 'text-blue-600 border-b-2 border-blue-600'
// 							: 'text-gray-500 hover:text-gray-700'
// 					}`}>
// 					My Groups
// 				</button>
// 				<button
// 					onClick={() => setActiveTab('search')}
// 					className={`px-4 py-2 font-medium ${
// 						activeTab === 'search'
// 							? 'text-blue-600 border-b-2 border-blue-600'
// 							: 'text-gray-500 hover:text-gray-700'
// 					}`}>
// 					Search Groups
// 				</button>
// 			</div>

// 			{/* Content */}
// 			{activeTab === 'my-groups' && (
// 				<div>
// 					{loading ? (
// 						<p>Loading...</p>
// 					) : myGroups.length > 0 ? (
// 						myGroups.map((group) => (
// 							<GroupCard
// 								key={group._id}
// 								group={group}
// 								onLeave={handleLeaveGroup}
// 								isJoined={true}
// 							/>
// 						))
// 					) : (
// 						<p className='text-gray-500'>
// 							You haven't joined any groups yet.
// 						</p>
// 					)}
// 				</div>
// 			)}

// 			{activeTab === 'search' && <GroupSearch />}
// 		</div>
// 	);
// };

// export default Groups;

import { useState, useEffect } from 'react';
import api from '../lib/axios';
import GroupCard from '../components/GroupCard';
import CreateGroup from '../components/CreateGroup';
import { useUser } from '../hooks/useUser';

const Groups = () => {
	const { user, setUser } = useUser();
	const [activeTab, setActiveTab] = useState('my-groups');
	const [loading, setLoading] = useState(false);
	const [myGroups, setMyGroups] = useState([]);

	useEffect(() => {
		if (activeTab === 'my-groups') {
			fetchMyGroups();
		}
	}, [activeTab, user]);

	const fetchMyGroups = async () => {
		if (!user || !user.groups || user.groups.length === 0) {
			setMyGroups([]);
			return;
		}
		setLoading(true);
		try {
			const groupPromises = user.groups.map(async (groupId) => {
				try {
					const res = await api.get(`/groups/${groupId}`);
					return res.data.group;
				} catch (error) {
					console.warn(
						`Group ${groupId} not found or error:`,
						error.response?.data,
					);
					return null;
				}
			});

			const groups = (await Promise.all(groupPromises)).filter(Boolean); // מסנן null
			setMyGroups(groups);
		} catch (error) {
			console.error(
				'Group fetch error:',
				error.response?.data || error.message,
			);
			setMyGroups([]);
		} finally {
			setLoading(false);
		}
	};

	const handleLeaveGroup = async (groupId) => {
		const currentGroup = myGroups.find((group) => group._id === groupId);
		if (currentGroup && currentGroup.creator._id === user._id) {
			if (
				window.confirm(
					'You are the creator of this group. Do you want to delete it?',
				)
			) {
				try {
					await api.delete(`/groups/${groupId}`);
					setMyGroups(
						myGroups.filter((group) => group._id !== groupId),
					);
					setUser({
						...user,
						groups: user.groups.filter((id) => id !== groupId),
					});
				} catch (error) {
					alert('Error deleting group');
					console.error('Error deleting group:', error);
				}
			}
			return;
		}

		try {
			await api.post(`/groups/${groupId}/leave`);
			setMyGroups(myGroups.filter((group) => group._id !== groupId));
			setUser({
				...user,
				groups: user.groups.filter((id) => id !== groupId),
			});
		} catch (error) {
			alert('Error leaving group');
			console.error('Error leaving group:', error);
		}
	};

	return (
		<div className='max-w-4xl mx-auto p-4'>
			<h1 className='text-3xl font-bold mb-6'>Groups</h1>

			{/* Tabs */}
			<div className='flex border-b mb-6'>
				<button
					onClick={() => setActiveTab('my-groups')}
					className={`px-4 py-2 font-medium ${
						activeTab === 'my-groups'
							? 'text-blue-600 border-b-2 border-blue-600'
							: 'text-gray-500 hover:text-gray-700'
					}`}>
					My Groups
				</button>

				<button
					onClick={() => setActiveTab('create-group')}
					className={`px-4 py-2 font-medium ${
						activeTab === 'create-group'
							? 'text-blue-600 border-b-2 border-blue-600'
							: 'text-gray-500 hover:text-gray-700'
					}`}>
					Create group
				</button>

				<button
					onClick={() => setActiveTab('search')}
					className={`px-4 py-2 font-medium ${
						activeTab === 'search'
							? 'text-blue-600 border-b-2 border-blue-600'
							: 'text-gray-500 hover:text-gray-700'
					}`}>
					Search Groups
				</button>
			</div>

			{/* Content */}
			{activeTab === 'my-groups' && (
				<div>
					{loading ? (
						<p>Loading...</p>
					) : myGroups.length > 0 ? (
						myGroups.map((group) => (
							<GroupCard
								key={group._id}
								group={group}
								onLeave={handleLeaveGroup}
								isJoined={true}
							/>
						))
					) : (
						<p className='text-gray-500'>
							You haven't joined any groups yet.
						</p>
					)}
				</div>
			)}
			{activeTab === 'create-group' && <CreateGroup />}

			{activeTab === 'search' && <GroupSearch />}
		</div>
	);
};

{
	/* // <div>
		// 	<CreateGroup />
		// </div> */
}

export default Groups;
