// import FeedButton from './FeedButton';
// import ProfilePicture from './ProfilePicture';
// import RecommendRoundedIcon from '@mui/icons-material/RecommendRounded';
// import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
// import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
// import EditRoundedIcon from '@mui/icons-material/EditRounded';
// import { useState } from 'react';
// import { useUser } from '../hooks/useUser';

// import api from '../lib/axios';

// // TODO: Show media in the post
// // TODO: add tags to the post

// // TODO: Fix edit post-change text, when user click on edit button, the post is not updated but in mongoDB it is updated and return 404
// const Post = ({ post, onPostChange }) => {
// 	const [editing, setEditing] = useState(false);
// 	const [content, setContent] = useState(post.content);
// 	const [saving, setSaving] = useState(false);

// 	const { user } = useUser();
// 	if (!post) return null;

// 	const author = post.author;

// 	// const user = JSON.parse(localStorage.getItem('user'));

// 	const handleSave = async () => {
// 		setSaving(true);
// 		try {
// 			const res = await api.put(`/posts/${post._id}`, { content });
// 			setEditing(false);
// 			if (res.status === 200) {
// 				onPostChange();
// 			}
// 		} catch (error) {
// 			console.error('Error updating post:', error);
// 			alert('Failed to update post');
// 		} finally {
// 			setSaving(false);
// 		}
// 	};

// 	const handleDeletePost = async (postId) => {
// 		try {
// 			const res = await api.delete(`/posts/${postId}`);
// 			if (res.status === 200) {
// 				onPostChange();
// 			}
// 		} catch (error) {
// 			console.error('Error deleting post:', error);
// 		}
// 	};

// 	return (
// 		<div className='border border-gray-200 p-4 rounded-2xl mt-2'>
// 			<div className='flex flex-row gap-2 items-center mb-2'>
// 				<ProfilePicture
// 					width={50}
// 					height={50}
// 					picture={author?.profile?.avatar.url || undefined}
// 				/>
// 				<span className='text-gray-700 text-lg font-bold'>
// 					{author?.profile?.firstName} {author?.profile?.lastName}
// 				</span>
// 				{user._id === post.author._id && (
// 					<EditRoundedIcon
// 						className='text-gray-500 ml-auto cursor-pointer hover:bg-blue-100 rounded-full'
// 						// onClick={() => handlePostEdit(post._id)}
// 						onClick={() => setEditing(true)}
// 					/>
// 				)}
// 			</div>
// 			<span className='text-gray-500 text-sm'>
// 				{new Date(post.createdAt).toLocaleString('he-IL', {
// 					day: '2-digit',
// 					month: '2-digit',
// 					year: 'numeric',
// 				})}
// 			</span>
// 			{editing ? (
// 				<div>
// 					<input
// 						type='text'
// 						className='w-full border rounded p-2'
// 						value={content}
// 						onChange={(e) => setContent(e.target.value)}
// 					/>
// 					<FeedButton onClick={handleSave} disabled={saving}>
// 						{saving ? 'Saving...' : 'Save'}
// 					</FeedButton>
// 					<FeedButton
// 						onClick={() => setEditing(false)}
// 						disabled={saving}>
// 						Cancel
// 					</FeedButton>
// 				</div>
// 			) : (
// 				<div className='mb-2 text-gray-800 text-base'>
// 					{post.content}
// 				</div>
// 			)}
// 			{post.media && post.media.length > 0 && (
// 				<div className='flex flex-col gap-2 mb-2'>
// 					{post.media.map((item, idx) =>
// 						item.type === 'image' ? (
// 							<img
// 								key={idx}
// 								src={item.url}
// 								alt={`media-${idx}`}
// 								className='rounded-xl max-h-200 max-w-200'
// 							/>
// 						) : item.type === 'video' ? (
// 							<video
// 								key={idx}
// 								src={item.url}
// 								controls
// 								className='rounded-xl max-h-150  max-w-150'
// 							/>
// 						) : null,
// 					)}
// 				</div>
// 			)}
// 			{post.tags && post.tags.length > 0 && (
// 				<div className='flex flex-row gap-1 mb-2'>
// 					{post.tags.map((tag, idx) => (
// 						<span
// 							key={idx}
// 							className=' text-gray-500 px-2 py-1 rounded-full text-md font-semibold'>
// 							#{tag}
// 						</span>
// 					))}
// 				</div>
// 			)}
// 			<div className='flex flex-row gap-2 mb-2 items-center'>
// 				<span className='text-gray-500 text-md'>
// 					{post.likes.length} likes
// 				</span>
// 				<span className='text-gray-500 text-md'>
// 					{post.comments.length} comments
// 				</span>
// 			</div>
// 			<hr className='w-full mb-2 border-gray-200' />
// 			<div className={'flex flex-row gap-2 items-center '}>
// 				<FeedButton className=' justify-center items-center border border-gray-200 rounded-full'>
// 					<RecommendRoundedIcon className='text-gray-500 mr-2' />
// 					Like
// 				</FeedButton>
// 				<FeedButton className=' justify-center items-center border border-gray-200 rounded-full'>
// 					<ForumRoundedIcon className='text-gray-500 mr-2' />
// 					Comment
// 				</FeedButton>
// 				{user._id === post.author._id && (
// 					<DeleteOutlineRoundedIcon
// 						className='text-gray-500 ml-auto cursor-pointer hover:bg-blue-100 rounded-full'
// 						onClick={() => handleDeletePost(post._id)}
// 					/>
// 				)}
// 			</div>
// 		</div>
// 	);
// };

// export default Post;

import FeedButton from './FeedButton';
import ProfilePicture from './ProfilePicture';
import RecommendRoundedIcon from '@mui/icons-material/RecommendRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { useState, useEffect } from 'react';
import { useUser } from '../hooks/useUser';
import api from '../lib/axios';
import Comment from './Comment';

const Post = ({ post, onPostChange }) => {
	const [editing, setEditing] = useState(false);
	const [content, setContent] = useState(post?.content || '');
	const [saving, setSaving] = useState(false);
	const [comments, setComments] = useState(post.comments || []);
	const [loadingComments, setLoadingComments] = useState(true);
	const { user } = useUser();

	useEffect(() => {
		if (!post || !post._id) return;
		fetchComments();
		// eslint-disable-next-line
	}, [post?._id]);

	if (!post) return null;
	if (!post.author) return null;
	if (!user) return null;

	const author = post.author;

	const fetchComments = async () => {
		setLoadingComments(true);
		try {
			const res = await api.get(
				`/comments/post/${post._id}?sortBy=newest&page=1&limit=20`,
			);
			setComments(res.data.comments);
		} catch (err) {
			console.error('Failed to fetch comments:', err);
		} finally {
			setLoadingComments(false);
		}
	};

	const handleCommentAdded = () => {
		fetchComments();
		onPostChange && onPostChange();
	};

	const handleSave = async () => {
		setSaving(true);
		try {
			const res = await api.put(`/posts/${post._id}`, { content });
			setEditing(false);
			if (res.status === 200) {
				onPostChange();
			}
		} catch (error) {
			console.error('Error updating post:', error);
			alert('Failed to update post');
		} finally {
			setSaving(false);
		}
	};

	const handleDeletePost = async (postId) => {
		try {
			const res = await api.delete(`/posts/${postId}`);
			if (res.status === 200) {
				onPostChange();
			}
		} catch (error) {
			console.error('Error deleting post:', error);
		}
	};

	return (
		<div className='border border-gray-200 p-4 rounded-2xl mt-2'>
			{post.visibility === 'group' && post.group && post.group.name && (
				<div className='text-blue-300 font-bold text-md mb-1'>
					Group :{post.group.name}
				</div>
			)}
			<div className='flex flex-row gap-2 items-center mb-2'>
				<ProfilePicture
					width={50}
					height={50}
					picture={author?.profile?.avatar?.url || undefined}
				/>
				<span className='text-gray-700 text-lg font-bold'>
					{author?.profile?.firstName} {author?.profile?.lastName}
				</span>
				{user._id === post.author._id && (
					<EditRoundedIcon
						className='text-gray-500 ml-auto cursor-pointer hover:bg-blue-100 rounded-full'
						onClick={() => setEditing(true)}
					/>
				)}
			</div>
			<span className='text-gray-500 text-sm'>
				{new Date(post.createdAt).toLocaleString('he-IL', {
					day: '2-digit',
					month: '2-digit',
					year: 'numeric',
				})}
			</span>
			{editing ? (
				<div>
					<input
						type='text'
						className='w-full border rounded p-2'
						value={content}
						onChange={(e) => setContent(e.target.value)}
					/>
					<FeedButton onClick={handleSave} disabled={saving}>
						{saving ? 'Saving...' : 'Save'}
					</FeedButton>
					<FeedButton
						onClick={() => setEditing(false)}
						disabled={saving}>
						Cancel
					</FeedButton>
				</div>
			) : (
				<div className='mb-2 text-gray-800 text-base'>
					{post.content}
				</div>
			)}
			{post.media && post.media.length > 0 && (
				<div className='flex flex-col gap-2 mb-2'>
					{post.media.map((item, idx) =>
						item.type === 'image' ? (
							<img
								key={idx}
								src={item.url}
								alt={`media-${idx}`}
								className='rounded-xl max-h-200 max-w-200'
							/>
						) : item.type === 'video' ? (
							<video
								key={idx}
								src={item.url}
								controls
								className='rounded-xl max-h-150 max-w-150'
							/>
						) : null,
					)}
				</div>
			)}
			{post.tags && post.tags.length > 0 && (
				<div className='flex flex-row gap-1 mb-2'>
					{post.tags.map((tag, idx) => (
						<span
							key={idx}
							className='text-gray-500 px-2 py-1 rounded-full text-md font-semibold'>
							#{tag}
						</span>
					))}
				</div>
			)}
			<div className='flex flex-row gap-2 mb-2 items-center'>
				<span className='text-gray-500 text-md'>
					{post.likes?.length || 0} likes
				</span>
				<span className='text-gray-500 text-md'>
					{post.comments?.length || 0} comments
				</span>
			</div>
			<hr className='w-full mb-2 border-gray-200' />
			<div className={'flex flex-row gap-2 items-center '}>
				<FeedButton className='justify-center items-center border border-gray-200 rounded-full'>
					<RecommendRoundedIcon className='text-gray-500 mr-2' />
					Like
				</FeedButton>
				{/* <FeedButton className='justify-center items-center border border-gray-200 rounded-full'>
					<ForumRoundedIcon className='text-gray-500 mr-2' />
					Comment
				</FeedButton> */}
				{user._id === post.author._id && (
					<DeleteOutlineRoundedIcon
						className='text-gray-500 ml-auto cursor-pointer hover:bg-blue-100 rounded-full'
						onClick={() => handleDeletePost(post._id)}
					/>
				)}
			</div>
			{/* <Comment postId={post._id} onCommentAdded={handleCommentAdded} />
			<div className='mt-2'>
				{comments.map((comment) => (
					<div key={comment._id} className='border-b py-2'>
						<strong>{comment.author?.profile?.firstName}:</strong>{' '}
						{comment.content}
					</div>
				))}
			</div> */}
			<Comment postId={post._id} onCommentAdded={handleCommentAdded} />
			<div className='mt-2'>
				{loadingComments ? (
					<div>loading...</div>
				) : (
					comments.map((comment) => (
						<div key={comment._id} className='border-b py-2'>
							<strong>
								{comment.author?.profile?.firstName}:
							</strong>{' '}
							{comment.content}
						</div>
					))
				)}
			</div>
		</div>
	);
};

export default Post;
