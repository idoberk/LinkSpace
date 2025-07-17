'use client';

const UserCard = ({ user, onSendFriendRequest }) => {
	return (
		<div className='bg-white rounded-lg shadow-md p-4 mb-4'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center'>
					<div className='w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center'>
						{user.profilePicture ? (
							<img
								src={user.profilePicture || '/placeholder.svg'}
								alt={user.username}
								className='w-12 h-12 rounded-full object-cover'
							/>
						) : (
							<span className='text-gray-600 font-bold text-lg'>
								{user.username.charAt(0).toUpperCase()}
							</span>
						)}
					</div>
					<div className='ml-3'>
						<h3 className='font-semibold text-lg'>
							{user.username}
						</h3>
						<p className='text-gray-600 text-sm'>{user.email}</p>
						{user.bio && (
							<p className='text-gray-500 text-xs mt-1'>
								{user.bio}
							</p>
						)}
					</div>
				</div>
				<div>
					{user.friendRequestSent ? (
						<button
							disabled
							className='bg-gray-400 text-white px-4 py-2 rounded-md text-sm cursor-not-allowed'>
							Request Sent
						</button>
					) : user.isFriend ? (
						<button
							disabled
							className='bg-green-500 text-white px-4 py-2 rounded-md text-sm cursor-not-allowed'>
							Friends
						</button>
					) : (
						<button
							onClick={() => onSendFriendRequest(user._id)}
							className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm'>
							Add Friend
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default UserCard;
