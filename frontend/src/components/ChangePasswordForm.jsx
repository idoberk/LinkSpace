import { useState } from 'react';
import api from '../lib/axios';
import Button from './Button';
import AlertMessage from './AlertMessage';
import { PasswordInput } from './PasswordInput';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

const ChangePasswordForm = ({ onClose }) => {
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [alert, setAlert] = useState(null);

	const isValid =
		newPassword.length >= 8 &&
		newPassword === confirmPassword &&
		currentPassword.length > 0;

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setAlert(null);
		try {
			await api.put('/account/password', {
				currentPassword,
				newPassword,
			});
			setAlert({
				type: 'success',
				message: 'Password changed successfully!',
			});
			setCurrentPassword('');
			setNewPassword('');
			setConfirmPassword('');
			if (onClose) onClose();
		} catch (err) {
			setAlert({
				type: 'error',
				message:
					err?.response?.data?.message ||
					'Failed to change password.',
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
				<PasswordInput
					labelStyle='block text-sm font-medium text-gray-500 mb-1'
					inputStyle='w-full px-4 py-2 border rounded-lg border-gray-300 pr-12'
					placeholder='Current password'
					value={currentPassword}
					onChange={(e) => setCurrentPassword(e.target.value)}
					required
				/>
				<PasswordInput
					labelStyle='block text-sm font-medium text-gray-500 mb-1'
					inputStyle='w-full px-4 py-2 border rounded-lg border-gray-300 pr-12'
					placeholder='New password'
					value={newPassword}
					onChange={(e) => setNewPassword(e.target.value)}
					required
				/>
				<PasswordStrengthIndicator password={newPassword} />
				<PasswordInput
					labelStyle='block text-sm font-medium text-gray-500 mb-1'
					inputStyle='w-full px-4 py-2 border rounded-lg border-gray-300 pr-12'
					placeholder='Confirm new password'
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)}
					required
				/>
				{newPassword !== confirmPassword && (
					<p className='text-red-500 text-sm'>
						Passwords do not match
					</p>
				)}
				<div className='flex gap-2 justify-end'>
					<Button
						type='button'
						onClick={onClose}
						className='bg-gray-200 text-gray-700'>
						Cancel
					</Button>
					<Button
						type='submit'
						disabled={!isValid || loading}
						className='bg-blue-600 text-white'>
						{loading ? 'Saving...' : 'Change Password'}
					</Button>
				</div>
			</form>
		</div>
	);
};

export default ChangePasswordForm;
