import { useState, useEffect } from 'react';

const DeleteAccountModal = ({ deleting, onCancel, onDelete, error }) => {
	const [password, setPassword] = useState('');

	// Reset password when modal is opened
	useEffect(() => {
		setPassword('');
	}, []);

	const handleDelete = (e) => {
		e.preventDefault();
		onDelete(password);
	};

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
			<div className='bg-white p-6 rounded-lg shadow-lg w-full max-w-md'>
				<h2 className='text-xl font-bold mb-4'>Confirm Deletion</h2>
				<p className='mb-4 text-gray-600'>
					Please enter your password to delete your account. This
					action cannot be undone.
				</p>
				<form onSubmit={handleDelete}>
					<input
						type='password'
						placeholder='Your password'
						className='w-full border border-gray-300 rounded px-3 py-2 mb-2'
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						autoFocus
						required
						aria-label='Password for account deletion'
					/>
					{error && (
						<div className='text-red-600 text-sm mb-2'>{error}</div>
					)}
					<div className='flex justify-end gap-2 mt-2'>
						<button
							type='button'
							className='px-4 py-2 bg-gray-200 rounded hover:bg-gray-300'
							onClick={onCancel}>
							Cancel
						</button>
						<button
							type='submit'
							className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700'
							disabled={deleting}>
							{deleting ? 'Deleting...' : 'Delete'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default DeleteAccountModal;
