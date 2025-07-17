import { useState } from 'react';
import TopBar from './TopBar';
import Input from './Input';
import api from '../lib/axios';
import AlertMessage from './AlertMessage';
import FeedButton from './FeedButton';
import { useUser } from '../hooks/useUser';

const CreateGroup = () => {
	// const navigate = useNavigate();
	const { user, setUser } = useUser();
	const [form, setForm] = useState({
		name: '',
		description: '',
		category: 'other',
		privacy: 'public',
	});
	const [coverImage, setCoverImage] = useState(null);
	const [loading, setLoading] = useState(false);
	const [alert, setAlert] = useState(null);

	const categories = [
		'technology',
		'sports',
		'music',
		'gaming',
		'education',
		'business',
		'art',
		'health',
		'food',
		'travel',
		'photography',
		'books',
		'movies',
		'politics',
		'science',
		'other',
	];

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleFileChange = (e) => {
		setCoverImage(e.target.files[0]);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setAlert(null);

		try {
			const formData = new FormData();
			formData.append('name', form.name);
			formData.append('description', form.description);
			formData.append('category', form.category);
			formData.append('privacy', form.privacy);
			// formData.append('settings', JSON.stringify({}));
			formData.append(
				'settings',
				JSON.stringify({ joiningRequiresApproval: false }),
			);

			if (coverImage) {
				formData.append('coverImage', coverImage);
			}

			const res = await api.post('/groups', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});
			if (res.status === 200 || res.status === 201) {
				await api.put(`/groups/${res.data.group._id}`, {
					settings: { joiningRequiresApproval: false },
				});
			}
			const newGroup = res.data.group;

			setUser({
				...user,
				groups: [...user.groups, newGroup._id],
			});

			setAlert({
				type: 'success',
				message: 'Group created successfully!',
			});
		} catch (error) {
			console.error('Error creating group:', error);
			setAlert({
				type: 'error',
				message:
					error.response?.data?.errors?.message ||
					'Failed to create group',
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='bg-gray-50 min-h-screen'>
			<TopBar />
			<div className='pt-20 px-4 max-w-2xl mx-auto'>
				{alert && (
					<AlertMessage
						type={alert.type}
						message={alert.message}
						onClose={() => setAlert(null)}
					/>
				)}

				<div className='bg-white rounded-lg shadow-md p-6'>
					<h2 className='text-2xl font-bold text-gray-800 mb-6'>
						Create New Group
					</h2>

					<form onSubmit={handleSubmit} className='space-y-6'>
						<Input
							label='Group Name'
							name='name'
							value={form.name}
							onChange={handleInputChange}
							placeholder='Enter group name...'
							inputStyle='w-full px-4 py-2 border rounded-lg border-gray-300'
							labelStyle='block text-sm font-medium text-gray-700 mb-2'
							required
						/>

						<div>
							<label className='block text-sm font-medium text-gray-700 mb-2'>
								Description
							</label>
							<textarea
								name='description'
								value={form.description}
								onChange={handleInputChange}
								placeholder='Describe your group...'
								rows={4}
								className='w-full px-4 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-50'
								required
							/>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 mb-2'>
								Category
							</label>
							<select
								name='category'
								value={form.category}
								onChange={handleInputChange}
								className='w-full px-4 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
								required>
								{categories.map((cat) => (
									<option
										key={cat}
										value={cat}
										className='capitalize'>
										{cat}
									</option>
								))}
							</select>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 mb-2'>
								Privacy
							</label>
							<select
								name='privacy'
								value={form.privacy}
								onChange={handleInputChange}
								className='w-full px-4 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-50'
								required>
								<option value='public'>
									public
									{/* Public - Anyone can see and join */}
								</option>
								<option value='private'>
									private
									{/* Private - Only members can see content */}
								</option>
							</select>
						</div>

						{/* <div>
							<label className='block text-sm font-medium text-gray-700 mb-2'>
								Cover Image (Optional)
							</label>
							<input
								type='file'
								accept='image/*'
								onChange={handleFileChange}
								className='w-full px-4 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-50'
							/>
						</div> */}

						<div className='flex gap-4'>
							<FeedButton type='submit' disabled={loading}>
								{loading ? 'Creating...' : 'Create Group'}
							</FeedButton>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default CreateGroup;
