import FeedButton from './FeedButton';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';

const CreateGroup = () => {
	const [form, setForm] = useState({
		name: '',
		description: '',
		category: '',
		privacy: '',
	});
	// const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		// setLoading(true);
		try {
			const formData = new FormData();
			formData.append('name', form.name);
			formData.append('description', form.description);
			formData.append('category', form.category);
			formData.append('privacy', form.privacy);
			formData.append('settings', JSON.stringify({}));
			const response = await api.post('/groups', formData);
			// const response = await api.post('/groups', {
			// 	name: form.name,
			// 	description: form.description,
			// 	category: form.category,
			// 	privacy: form.privacy,
			// });
			console.log(response);
			alert('Group created successfully');
			navigate('/groups');
		} catch (error) {
			alert('Could not create group ');
			console.error(error);
		}
		// } finally {
		// 	setLoading(false);
		// }
	};
	return (
		<form
			className='w-150 rounded-md p-4 border border-gray-500 ml-4 mt-2 '
			onSubmit={handleSubmit}>
			<h2 className='text-center mt-4 text-2xl text-gray-600 font-bold'>
				Create New Group
			</h2>
			<h1>Group Name</h1>
			<div className='flex flex-col mt-4 gap-4'>
				<input
					type='text'
					value={form.name}
					onChange={(e) => setForm({ ...form, name: e.target.value })}
					required
					className='border border-gray-500 rounded-md p-2'
				/>
				<h1>Group Description</h1>
				<input
					type='text'
					value={form.description}
					onChange={(e) =>
						setForm({ ...form, description: e.target.value })
					}
					required
					className='border border-gray-500 rounded-md p-2 vertical-align: top align-top text-left;'
				/>
				<select
					type='text'
					name='category'
					placeholder='category'
					value={form.category}
					onChange={(e) =>
						setForm({ ...form, category: e.target.value })
					}
					required
					className='border border-gray-500 rounded-md p-3'>
					<option value='Technology'>Technology</option>
					<option value='Sports'>Sports</option>
					<option value='Music'>Music</option>
					<option value='Art'>Art</option>
					<option value='Gaming'>Gaming</option>
					<option value='Education'>Education</option>
					<option value='Travel'>Travel</option>
					<option value='Food'>Food</option>
					<option value='Health'>Health</option>
					<option value='Other'>Other</option>
				</select>
				<select
					text='privacy'
					value={form.privacy}
					onChange={(e) =>
						setForm({ ...form, privacy: e.target.value })
					}
					required
					className='border border-gray-500 rounded-md p-2'>
					<option value='public'>Public</option>
					<option value='private'>Private</option>
				</select>
				{/* addcoverimage */}
			</div>
			<FeedButton type='submit' className='mt-4 '>
				{/* // onClick={handleSubmit}
				// disabled={loading} */}
				Create group
				{/* {loading ? 'Creating...' : 'Create Group'} */}
			</FeedButton>
			<FeedButton
				className='mt-4 ml-4'
				onClick={() => navigate('/groups')}>
				Cancel
			</FeedButton>
		</form>
	);
};

export default CreateGroup;

// import React, { useState } from 'react';
// import api from '../lib/axios';
// import { useNavigate } from 'react-router-dom';
// import GroupCard from './GroupCard';

// const CreateGroup = () => {
// 	const [name, setName] = useState('');
// 	const [description, setDescription] = useState('');
// 	const [privacy, setPrivacy] = useState('public');
// 	const [category, setCategory] = useState('other');
// 	const [coverImage, setCoverImage] = useState(null);
// 	// const { settings } = useState({
// 	// 	joiningRequiresApproval: true,

// 	// });
// 	const [settings, setSettings] = useState({
// 		joiningRequiresApproval: true,
// 	});
// 	const [createdGroup, setCreatedGroup] = useState(null);

// 	const [error, setError] = useState('');
// 	const [loading, setLoading] = useState(false);

// 	const navigate = useNavigate();

// 	const handleFileChange = (e) => {
// 		setCoverImage(e.target.files[0]);
// 	};

// 	const handleSubmit = async (e) => {
// 		e.preventDefault();
// 		setLoading(true);
// 		setError('');
// 		console.log('Sending group data:', {
// 			name,
// 			description,
// 			privacy,
// 			category,
// 			settings,
// 			coverImage,
// 		});
// 		try {
// 			const formData = new FormData();
// 			formData.append('name', name);
// 			formData.append('description', description);
// 			formData.append('privacy', privacy);
// 			formData.append('category', category);
// 			formData.append('settings', JSON.stringify(settings));
// 			if (coverImage) {
// 				formData.append('file', coverImage);
// 			}

// 			const res = await api.post('/groups', formData, {
// 				headers: { 'Content-Type': 'multipart/form-data' },
// 			});

// 			const group = res.data.group;
// 			setCreatedGroup(group);
// 			console.log({ group });
// 			// navigate(`/groupcard/${group._id}`, { state: { group } });
// 			navigate(`/groupcard`, { state: { group } });
// 		} catch (err) {
// 			setError(
// 				err.response?.data?.errors?.message ||
//
// 			);
// 		} finally {
// 			setLoading(false);
// 		}
// 	};

// 	return (
// 		<div className='create-group-container'>
// 			<h2>new group/h2>
// 			{!createdGroup ? (
// 				<form onSubmit={handleSubmit} encType='multipart/form-data'>
// 					<label>

// 						<input
// 							value={name}
// 							onChange={(e) => setName(e.target.value)}
// 							required
// 						/>
// 					</label>
// 					<label>

// 						<input
// 							value={description}
// 							onChange={(e) => setDescription(e.target.value)}
// 						/>
// 					</label>
// 					<label>
// 						<select
// 							value={privacy}
// 							onChange={(e) => setPrivacy(e.target.value)}>
// 							<option value='public'>public</option>
// 							<option value='private'>private</option>
// 						</select>
// 					</label>
// 					<label>

// 						<input
// 							value={category}
// 							onChange={(e) => setCategory(e.target.value)}
// 						/>
// 					</label>
// 					<label>
// 						<input
// 							type='file'
// 							accept='image/*'
// 							onChange={handleFileChange}
// 						/>
// 					</label>
// 					<button type='submit' disabled={loading}>
// 						{loading ? 'creating...' : 'create group'}
// 					</button>
// 					{error && <div className='error'>{error}</div>}
// 				</form>
// 			) : (
// 				<GroupCard group={createdGroup} />
// 			)}
// 		</div>
// 	);
// };

// export default CreateGroup;
