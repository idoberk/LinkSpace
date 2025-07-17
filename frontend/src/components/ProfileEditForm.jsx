import { useState } from 'react';
import { useUser } from '../hooks/useUser';
import api from '../lib/axios';
import Input from './Input';
import FeedButton from './FeedButton';
import AlertMessage from './AlertMessage';

const ProfileEditForm = ({ onClose }) => {
	const { user, setUser } = useUser();
	const [form, setForm] = useState({
		firstName: user?.profile?.firstName || '',
		lastName: user?.profile?.lastName || '',
		bio: user?.profile?.bio || '',
		address: user?.profile?.address || '',
		birthDate: user?.profile?.birthDate
			? user.profile.birthDate.slice(0, 10)
			: '',
	});
	const [loading, setLoading] = useState(false);
	const [alert, setAlert] = useState(null);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setAlert(null);
		try {
			await api.put('/account/profile', {
				profile: {
					...user.profile,
					firstName: form.firstName,
					lastName: form.lastName,
					bio: form.bio,
					address: form.address,
					birthDate: form.birthDate,
				},
			});
			const res = await api.get('/account/profile');
			setUser(res.data);
			setAlert({
				type: 'success',
				message: 'Profile updated successfully!',
			});
			if (onClose) onClose();
		} catch (err) {
			setAlert({
				type: 'error',
				message:
					err?.response?.data?.message || 'Failed to update profile.',
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='w-full max-w-lg mx-auto p-4 bg-white rounded-lg shadow'>
			{alert && (
				<AlertMessage
					type={alert.type}
					message={alert.message}
					onClose={() => setAlert(null)}
				/>
			)}
			<form onSubmit={handleSubmit} className='space-y-4'>
				<Input
					label='First Name'
					id='firstName'
					name='firstName'
					value={form.firstName}
					onChange={handleChange}
					inputStyle='w-full px-4 py-2 border rounded-lg border-gray-300'
					required
				/>
				<Input
					label='Last Name'
					id='lastName'
					name='lastName'
					value={form.lastName}
					onChange={handleChange}
					inputStyle='w-full px-4 py-2 border rounded-lg border-gray-300'
					required
				/>
				<Input
					label='Bio'
					id='bio'
					name='bio'
					value={form.bio}
					onChange={handleChange}
					inputStyle='w-full px-4 py-2 border rounded-lg border-gray-300'
					maxLength={350}
					as='textarea'
				/>
				<Input
					label='Address'
					id='address'
					name='address'
					value={form.address}
					onChange={handleChange}
					inputStyle='w-full px-4 py-2 border rounded-lg border-gray-300'
				/>
				<Input
					label='Birthdate'
					id='birthDate'
					name='birthDate'
					type='date'
					value={form.birthDate}
					onChange={handleChange}
					inputStyle='w-full px-4 py-2 border rounded-lg border-gray-300'
				/>
				<div className='flex gap-2 justify-end'>
					<FeedButton
						type='button'
						onClick={onClose}
						className='bg-gray-200 text-gray-700'>
						Cancel
					</FeedButton>
					<FeedButton
						type='submit'
						disabled={loading}
						className='bg-blue-600 text-white'>
						{loading ? 'Saving...' : 'Save Changes'}
					</FeedButton>
				</div>
			</form>
		</div>
	);
};

export default ProfileEditForm;
