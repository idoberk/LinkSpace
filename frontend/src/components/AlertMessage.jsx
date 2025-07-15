import { useEffect, useState } from 'react';

const typeStyles = {
	success: 'bg-green-100 border-green-400 text-green-700',
	error: 'bg-red-100 border-red-400 text-red-700',
	info: 'bg-blue-100 border-blue-400 text-blue-700',
	warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
};

const AlertMessage = ({ message, type = 'info', duration = 4000, onClose }) => {
	const [visible, setVisible] = useState(true);

	useEffect(() => {
		if (!visible) return;
		const timer = setTimeout(() => {
			setVisible(false);
			if (onClose) onClose();
		}, duration);
		return () => clearTimeout(timer);
	}, [visible, duration, onClose]);

	if (!visible) return null;

	return (
		<div
			className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg border shadow-lg flex items-center gap-3 ${
				typeStyles[type] || typeStyles.info
			}`}
			role='alert'>
			<span className='flex-1'>{message}</span>
			<button
				className='ml-4 text-lg font-bold focus:outline-none'
				onClick={() => {
					setVisible(false);
					if (onClose) onClose();
				}}
				aria-label='Close alert'>
				&times;
			</button>
		</div>
	);
};

export default AlertMessage;
