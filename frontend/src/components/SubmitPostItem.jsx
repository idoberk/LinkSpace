import FeedButton from './FeedButton';
import ProfilePicture from './ProfilePicture';
import SmartDisplayOutlinedIcon from '@mui/icons-material/SmartDisplayOutlined';
import PhotoSizeSelectActualOutlinedIcon from '@mui/icons-material/PhotoSizeSelectActualOutlined';
import { useState } from 'react';
import api from '../lib/axios';

// TODO: Upload media to the post

const SubmitPostItem = ({ onPostSubmit }) => {
	const [content, setContent] = useState('');
	// const [media, setMedia] = useState([]);
	const [tags, setTags] = useState([]);

	const handleUploadPost = async (e) => {
		e.preventDefault();

		const cleanForm = async () => {
			setContent('');
			// setMedia([]);
			setTags([]);
		};

		if (!content.trim()) return;
		try {
			await api.post('/posts', {
				content,
				tags,
			});
			cleanForm();
			if (onPostSubmit) onPostSubmit();
		} catch (error) {
			cleanForm();
			console.error('Error uploading post:', error);
			alert('There was an error uploading the post, please try again');
		}
	};

	return (
		<form
			onSubmit={handleUploadPost}
			className='rounded-2xl w-2/3 mt-2 border border-blue-100  p-2 flex flex-col justify-center items-center'
			style={{
				boxShadow: '0 0 16px 0 #eef4ff',
			}}>
			<div className='flex flex-row justify-between items-center w-full'>
				<ProfilePicture
					width={50}
					height={50}
					picture='https://fastly.picsum.photos/id/58/1280/853.jpg?hmac=YO3QnOm9TpyM5DqsJjoM4CHg8oIq4cMWLpd9ALoP908'
					// picture={user?.profile?.avatar || undefined}
				/>
				<input
					className=' w-full p-2 rounded-2xl h-20 border-transparent focus:outline-none text-2xl '
					type='text'
					placeholder='Share your thoughts with the community :)'
					value={content}
					onChange={(e) => setContent(e.target.value)}
				/>
			</div>
			<hr className='w-full border-gray-200 mb-3' />
			<div className='w-full p-2 rounded-2xl h-20 border-transparent focus:outline-none text-2xl flex flex-row gap-2 items-center justify-center mb-2'>
				<PhotoSizeSelectActualOutlinedIcon
					fontSize='large'
					className='text-gray-500'
				/>
				<SmartDisplayOutlinedIcon
					fontSize='large'
					className='text-gray-500'
				/>
				<FeedButton
					type='submit'
					className='hover:bg-blue-100'
					disabled={!content.trim()}>
					Post
				</FeedButton>
			</div>
		</form>
		// <div
		// 	className='rounded-2xl w-2/3 mt-6  shadow-2xl p-2 flex flex-col justify-center items-center'
		// 	style={{
		// 		boxShadow: '0 0 16px 0 #eef4ff',
		// 	}}>
		// 	<span className='flex flex-row justify-between items-center w-full'>
		// 		<ProfilePicture
		// 			width={50}
		// 			height={50}
		// 			picture='https://fastly.picsum.photos/id/58/1280/853.jpg?hmac=YO3QnOm9TpyM5DqsJjoM4CHg8oIq4cMWLpd9ALoP908'
		// 			// picture={user?.profile?.avatar || undefined}
		// 		/>
		// 		<input
		// 			className=' w-full p-2 rounded-2xl h-20 border-transparent focus:outline-none text-2xl text-center'
		// 			type='text'
		// 			placeholder='Share your thoughts with the community :)'
		// 		/>
		// 	</span>
		// 	<hr className='w-full border-gray-200 mb-3' />
		// 	<span className='flex flex-row gap-3 justify-between items-center mb-3'>
		// 		<PhotoSizeSelectActualOutlinedIcon
		// 			fontSize='large'
		// 			className='text-gray-500'
		// 		/>
		// 		<SmartDisplayOutlinedIcon
		// 			fontSize='large'
		// 			className='text-gray-500'
		// 		/>
		// 		<FeedButton>Submit</FeedButton>
		// 	</span>
		// </div>
	);
};

export default SubmitPostItem;
