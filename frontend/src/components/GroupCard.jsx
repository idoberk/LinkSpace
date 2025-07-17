//
'use client';
import { useUser } from '../hooks/useUser';
import { useState } from 'react';
import api from '../lib/axios';
const GroupCard = ({
	group,
	onJoin,
	onLeave,
	onDelete,
	onEdit,
	showEdit,
	showLeave,
	showJoin,
}) => {
	const { user } = useUser();
	const [isEditing, setIsEditing] = useState(false);
	const [editName, setEditName] = useState(group.name);
	const [editDescription, setEditDescription] = useState(group.description);
	const [loading, setLoading] = useState(false);

	const isCreator =
		typeof group.creator === 'object'
			? group.creator._id === user._id
			: group.creator === user._id;

	const isJoined = Array.isArray(user.groups)
		? user.groups.includes(group._id)
		: false;

	const handleEdit = () => {
		setIsEditing(true);
	};

	const handleEditCancel = () => {
		setIsEditing(false);
		setEditName(group.name);
		setEditDescription(group.description);
	};

	const handleEditSave = async () => {
		setLoading(true);
		try {
			await api.put(`/groups/${group._id}`, {
				name: editName,
				description: editDescription,
			});
			setIsEditing(false);
			onEdit(group._id, {
				name: editName,
				description: editDescription,
			});
		} catch (error) {
			alert('Error updating group');
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='bg-white rounded-lg shadow-md p-4 mb-4'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center'>
					<div className='ml-3'>
						{isEditing ? (
							<>
								<input
									type='text'
									value={editName}
									onChange={(e) =>
										setEditName(e.target.value)
									}
									className='border rounded px-2 py-1 mb-2 w-full'
								/>
								<textarea
									value={editDescription}
									onChange={(e) =>
										setEditDescription(e.target.value)
									}
									className='border rounded px-2 py-1 w-full'
								/>
							</>
						) : (
							<>
								<h3 className='font-semibold text-lg'>
									{group.name}
								</h3>
								<p className='text-gray-600 text-sm'>
									{group.description}
								</p>
							</>
						)}
						<p>{group.category}</p>
						<p className='text-gray-500 text-xs'>
							{group.members?.length || 0} members
						</p>
					</div>
				</div>
				<div>
					{isCreator && showEdit ? (
						isEditing ? (
							<div>
								<button
									onClick={handleEditSave}
									disabled={loading}
									className='bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm mr-2'>
									{loading ? 'Saving...' : 'Save'}
								</button>
								<button
									onClick={handleEditCancel}
									className='bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm'>
									Cancel
								</button>
							</div>
						) : (
							<div>
								<button
									onClick={handleEdit}
									className='bg-blue-300 hover:bg-blue-400 text-white px-4 py-2 rounded-md text-sm'>
									Edit
								</button>
								<button
									onClick={() => onDelete(group._id)}
									className='ml-2 bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm'>
									Delete
								</button>
							</div>
						)
					) : isJoined && showLeave ? (
						<button
							onClick={() => onLeave(group._id)}
							className='bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm'>
							Leave
						</button>
					) : !isJoined && showJoin && !isCreator ? (
						<button
							onClick={() => onJoin(group._id)}
							className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm'>
							Join
						</button>
					) : null}
				</div>
			</div>
		</div>
	);
};

export default GroupCard;
