import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

export const PasswordInput = ({ labelStyle, inputStyle, error, ...props }) => {
	const [showPassword, setShowPassword] = useState(false);

	const toggleShowPassword = () => {
		setShowPassword(!showPassword);
	};

	return (
		<div className='relative group'>
			<label htmlFor='password' className={labelStyle}>
				Password
			</label>
			<div className='relative'>
				<input
					id='password'
					type={showPassword ? 'text' : 'password'}
					className={inputStyle}
					{...props}
				/>
				<button
					type='button'
					onClick={toggleShowPassword}
					className='absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 focus:outline-none'
					aria-label={
						showPassword ? 'Hide password' : 'Show password'
					}>
					<FontAwesomeIcon
						icon={showPassword ? faEyeSlash : faEye}
						className='w-5 h-5'
					/>
				</button>
			</div>
			<div className='text-red-500'>{error && <p>{error}</p>}</div>
		</div>
	);
};
