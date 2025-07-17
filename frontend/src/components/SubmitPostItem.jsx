import FeedButton from './FeedButton';
import ProfilePicture from './ProfilePicture';
import SmartDisplayOutlinedIcon from '@mui/icons-material/SmartDisplayOutlined';
import PhotoSizeSelectActualOutlinedIcon from '@mui/icons-material/PhotoSizeSelectActualOutlined';
import { useRef, useState, useEffect } from 'react';
import api from '../lib/axios';
import { useUser } from '../hooks/useUser';

// TODO: Upload media to the post

const SubmitPostItem = ({ onPostSubmit }) => {
	const [content, setContent] = useState('');
	const [media, setMedia] = useState([]);
	const [tags, setTags] = useState([]);
	const [tagsInput, setTagsInput] = useState('');
	const [visibility, setVisibility] = useState('public');
	const [selectedGroup, setSelectedGroup] = useState('');
	const [userGroups, setUserGroups] = useState([]);
	const { user } = useUser();
	const fileInputRef = useRef();

	const cleanForm = async () => {
		setContent('');
		setMedia([]);
		setTags([]);
		setTagsInput('');
		setVisibility('public');
		setSelectedGroup('');
	};

	// useEffect(() => {
	// 	const fetchUserGroups = async () => {
	// 		try {
	// 			// const response = await api.get('/groups');

	// 			setUserGroups(response.data.groups);
	// 		} catch (error) {
	// 			console.error('Error fetching groups:', error);
	// 		}
	// 	};
	// 	fetchUserGroups();
	// }, []);

	useEffect(() => {
		fetchMyGroups();
	}, [user]);
	const fetchMyGroups = async () => {
		if (!user || !user.groups || user.groups.length === 0) {
			setUserGroups([]);
			return;
		}
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

			const groups = (await Promise.all(groupPromises)).filter(Boolean);
			setUserGroups(groups);
		} catch (error) {
			console.error(
				'Group fetch error:',
				error.response?.data || error.message,
			);
			setUserGroups([]);
		}
	};

	const handleVisibilityChange = (e) => {
		const newVisibility = e.target.value;
		setVisibility(newVisibility);
		if (newVisibility !== 'group') {
			setSelectedGroup('');
		}
	};

	const handleIconClick = () => {
		fileInputRef.current.click();
	};

	const handleMediaChange = (e) => {
		setMedia(e.target.files[0]);
	};

	const handleTagsChange = (e) => {
		setTagsInput(e.target.value);
		const tagsArray = e.target.value
			.split(',')
			.map((tag) => tag.trim())
			.filter((tag) => tag.length > 0);
		setTags(tagsArray);
	};

	const handleUploadPost = async (e) => {
		e.preventDefault();
		if (!content.trim()) return;

		const formData = new FormData();
		formData.append('content', content);
		formData.append('tags', tags.join(','));
		formData.append('visibility', visibility);
		if (visibility === 'group') {
			formData.append('groupId', selectedGroup);
		}
		if (media) formData.append('media', media);

		try {
			await api.post('/posts', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});
			// if (!content.trim()) return;
			// try {
			// 	await api.post('/posts', {
			// 		content,
			// 		tags,
			// 	});
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
					picture={user?.profile?.avatar?.url}
				/>
				<input
					className=' w-full p-2 rounded-2xl h-20 border-transparent focus:outline-none text-2xl '
					type='text'
					placeholder='Share your thoughts with the community :)'
					value={content}
					onChange={(e) => setContent(e.target.value)}
				/>
			</div>
			<hr className='w-full border-gray-200 mb-3 ' />
			<div className='w-full'>
				<h1 className='text-md text-gray-600 w-full'>Tags</h1>
				<input
					className='w-full'
					type='text'
					value={tagsInput}
					onChange={handleTagsChange}
					placeholder='Put your tags with a comma between them'
				/>
				<div>
					{tags.map((tag, idx) => (
						<span
							key={idx}
							style={{ marginRight: 5, color: 'purple' }}>
							#{tag}
						</span>
					))}
				</div>
			</div>
			<div className='w-full'>
				<hr className='w-full border-gray-200 mb-3' />
				<h1 className='text-md text-gray-600 w-full'>
					Post Visibility
				</h1>
				<select
					className='w-full p-2 border rounded'
					value={visibility}
					onChange={handleVisibilityChange}>
					<option value='public'>Public</option>
					<option value='group'>Group</option>
					<option value='private'>Private</option>
				</select>
				{visibility === 'group' && (
					<div className='w-full'>
						<h1 className='text-md text-gray-600 w-full'>
							Select Group
						</h1>
						<select
							className='w-full p-2 border rounded'
							value={selectedGroup}
							onChange={(e) => setSelectedGroup(e.target.value)}
							required>
							<option value=''>Choose a group...</option>
							{userGroups.map((group) => (
								<option key={group._id} value={group._id}>
									{group.name}
								</option>
							))}
						</select>
					</div>
				)}
			</div>
			<hr className='w-full border-gray-200 mb-3' />
			<input
				type='file'
				accept='image/*,video/*'
				ref={fileInputRef}
				style={{ display: 'none' }}
				onChange={handleMediaChange}
			/>
			<div className='w-full p-2 rounded-2xl h-20 border-transparent focus:outline-none text-2xl flex flex-row gap-2 items-center justify-center mb-2'>
				{/* <PhotoSizeSelectActualOutlinedIcon
					fontSize='large'
					className='text-gray-500'
				/> */}
				<SmartDisplayOutlinedIcon
					fontSize='large'
					className='text-gray-500 cursor-pointer'
					onClick={handleIconClick}
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
