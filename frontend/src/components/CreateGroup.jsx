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
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const formData = new FormData();
			formData.append('name', form.name);
			formData.append('description', form.description);
			formData.append('category', form.category);
			formData.append('privacy', form.privacy);
			const response = await api.post('/groups', formData);
			console.log(response);
			alert('Group created successfully');
			navigate('/groups');
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};
	return (
		<form className='w-150 rounded-md p-4 border border-gray-500 ml-4 mt-2 '>
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
					text='Category'
					placeholder='Category'
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
					<option value='Education'>Gaming</option>
					<option value='Travel'>Gaming</option>
					<option value='Food'>Gaming</option>
					<option value='Health'>Gaming</option>
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
			<FeedButton
				type='submit'
				className='mt-4 '
				onClick={handleSubmit}
				disabled={loading}>
				{loading ? 'Creating...' : 'Create Group'}
			</FeedButton>
		</form>
	);
};

export default CreateGroup;
