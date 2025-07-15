import { useState } from 'react';
import { useUser } from '../hooks/useUser';
import api from '../lib/axios';
import Button from './Button';
import AlertMessage from './AlertMessage';

const privacyOptions = ['public', 'friends', 'private'];

const ProfileSettingsForm = ({ onClose }) => {
	const { user, setUser } = useUser();
	const [privacy, setPrivacy] = useState({ ...user?.settings?.privacy });
	const [notifications, setNotifications] = useState({
		...user?.settings?.notifications,
	});
	const [loading, setLoading] = useState(false);
	const [alert, setAlert] = useState(null);

	const handlePrivacyChange = (e) => {
		const { name, value } = e.target;
		setPrivacy((prev) => ({ ...prev, [name]: value }));
	};

	const handleNotificationChange = (e) => {
		const { name, checked } = e.target;
		setNotifications((prev) => ({ ...prev, [name]: checked }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setAlert(null);
		try {
			await api.put('/account/profile', {
				settings: {
					privacy: { ...privacy },
					notifications: { ...notifications },
				},
			});
			const res = await api.get('/account/profile');
			setUser(res.data);
			setAlert({
				type: 'success',
				message: 'Settings updated successfully!',
			});
			if (onClose) onClose();
		} catch (err) {
			setAlert({
				type: 'error',
				message:
					err?.response?.data?.message ||
					'Failed to update settings.',
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
				<h3 className='font-semibold text-lg'>Privacy Settings</h3>
				{Object.entries(privacy).map(([key, value]) => (
					<div key={key} className='flex items-center gap-2'>
						<label className='w-40 capitalize'>
							{key.replace(/([A-Z])/g, ' $1')}
						</label>
						<select
							name={key}
							value={value}
							onChange={handlePrivacyChange}
							className='border rounded px-2 py-1'>
							{privacyOptions.map((opt) => (
								<option key={opt} value={opt}>
									{opt}
								</option>
							))}
						</select>
					</div>
				))}
				<h3 className='font-semibold text-lg mt-4'>
					Notification Settings
				</h3>
				{Object.entries(notifications).map(([key, value]) => (
					<div key={key} className='flex items-center gap-2'>
						<label className='w-40 capitalize'>
							{key.replace(/([A-Z])/g, ' $1')}
						</label>
						<input
							type='checkbox'
							name={key}
							checked={!!value}
							onChange={handleNotificationChange}
						/>
					</div>
				))}
				<div className='flex gap-2 justify-end'>
					<Button
						type='button'
						onClick={onClose}
						className='bg-gray-200 text-gray-700'>
						Cancel
					</Button>
					<Button
						type='submit'
						disabled={loading}
						className='bg-blue-600 text-white'>
						{loading ? 'Saving...' : 'Save Changes'}
					</Button>
				</div>
			</form>
		</div>
	);
};

export default ProfileSettingsForm;
