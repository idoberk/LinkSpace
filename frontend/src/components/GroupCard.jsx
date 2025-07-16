import React from 'react';
import { useLocation } from 'react-router-dom';

const GroupCard = () => {
	const location = useLocation();
	const group = location.state?.group;
	console.log({ group });
	if (!group) return null;

	return (
		<div className='border rounded-lg shadow-md p-4 bg-white max-w-xl mx-auto my-4'>
			{/* תמונת שער */}
			<h2>{group.name}</h2>
			<p>{group.description}</p>
			{group.coverImage?.url && (
				<img
					src={group.coverImage.url}
					alt='Group Cover'
					className='w-full h-48 object-cover rounded-md mb-4'
				/>
			)}

			{/* שם הקבוצה */}
			<h2 className='text-2xl font-bold text-blue-700 mb-2'>
				{group.name}
			</h2>

			{/* תיאור */}
			{group.description && (
				<p className='text-gray-700 mb-2'>{group.description}</p>
			)}

			{/* קטגוריה */}
			{group.category && (
				<div className='mb-2'>
					<span className='text-sm text-gray-500'>Category: </span>
					<span className='text-sm font-semibold'>
						{group.category}
					</span>
				</div>
			)}

			{/* מנהל */}
			{group.admin && (
				<div className='mb-2'>
					<span className='text-sm text-gray-500'>Admin: </span>
					<span className='text-sm font-semibold'>
						{group.admin.profile?.firstName}{' '}
						{group.admin.profile?.lastName}
					</span>
				</div>
			)}

			{/* חברים */}
			{group.members && (
				<div className='mb-2'>
					<span className='text-sm text-gray-500'>Members: </span>
					<span className='text-sm font-semibold'>
						{group.members.length}
					</span>
				</div>
			)}

			{/* תאריך יצירה */}
			{group.createdAt && (
				<div className='mb-2 text-xs text-gray-400'>
					Created at: {new Date(group.createdAt).toLocaleDateString()}
				</div>
			)}

			{/* פוסטים אחרונים (אם יש) */}
			{group.posts && group.posts.length > 0 && (
				<div className='mt-4'>
					<h3 className='text-lg font-semibold mb-2'>
						Recent Posts:
					</h3>
					<ul className='space-y-2'>
						{group.posts.slice(0, 3).map((post) => (
							<li key={post._id} className='border-b pb-2'>
								<div className='font-bold'>
									{post.author?.profile?.firstName}{' '}
									{post.author?.profile?.lastName}
								</div>
								<div className='text-gray-700'>
									{post.content}
								</div>
								<div className='text-xs text-gray-400'>
									{new Date(post.createdAt).toLocaleString()}
								</div>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
};

export default GroupCard;
