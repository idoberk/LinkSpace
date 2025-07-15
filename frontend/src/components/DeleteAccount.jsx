const DeleteAccountModal = ({
	password,
	setPassword,
	deleting,
	onCancel,
	onDelete,
}) => {
	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
			<div className='bg-white p-6 rounded-lg shadow-lg w-full max-w-md'>
				<h2 className='text-xl font-bold mb-4'>Confirm Deletion</h2>
				<p className='mb-4 text-gray-600'>
					Please enter your password to delete your account. This
					action cannot be undone.
				</p>
				<input
					type='password'
					placeholder='Your password'
					className='w-full border border-gray-300 rounded px-3 py-2 mb-4'
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<div className='flex justify-end gap-2'>
					<button
						className='px-4 py-2 bg-gray-200 rounded hover:bg-gray-300'
						onClick={onCancel}>
						Cancel
					</button>
					<button
						className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700'
						onClick={onDelete}
						disabled={deleting}>
						{deleting ? 'Deleting...' : 'Delete'}
					</button>
				</div>
			</div>
		</div>
	);
};

export default DeleteAccountModal;
