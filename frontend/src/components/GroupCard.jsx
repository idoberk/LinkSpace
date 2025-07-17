//
'use client';

const GroupCard = ({ group, onJoin, onLeave, isJoined }) => {
	return (
		<div className='bg-white rounded-lg shadow-md p-4 mb-4'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center'>
					{/* <div className='w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg'>
						{group.name.charAt(0).toUpperCase()}
					</div> */}
					<div className='ml-3'>
						<h3 className='font-semibold text-lg'>{group.name}</h3>
						<p className='text-gray-600 text-sm'>
							{group.description}
						</p>
						<p>{group.category}</p>
						<p className='text-gray-500 text-xs'>
							{group.members?.length || 0} members
						</p>
					</div>
				</div>
				<div>
					{isJoined ? (
						<button
							onClick={() => onLeave(group._id)}
							className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm'>
							Leave
						</button>
					) : (
						<button
							onClick={() => onJoin(group._id)}
							className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm'>
							Join
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default GroupCard;
