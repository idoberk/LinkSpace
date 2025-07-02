import { useState } from 'react';

import Input from './Input';
import api from '../lib/axios';
import { useInput } from '../hooks/useInput';
import { PasswordInput } from './PasswordInput';
import { MIN_PASS_LENGTH } from '../utils/constants';
import { hasMinLength, isEmail } from '../utils/validation';

const Login = ({ onSwitchToRegister }) => {
	const {
		value: emailValue,
		handleInputChange: handleEmailChange,
		handleInputBlur: handleEmailBlur,
		hasError: emailHasError,
	} = useInput('', (value) => isEmail(value));

	const {
		value: passwordValue,
		handleInputChange: handlePasswordChange,
		handleInputBlur: handlePasswordBlur,
		hasError: passwordHasError,
	} = useInput('', (value) => hasMinLength(value, MIN_PASS_LENGTH));

	const [loading, setLoading] = useState(false);

	const handleFormSubmit = async (e) => {
		e.preventDefault();

		if (emailHasError || passwordHasError) {
			return;
		}

		setLoading(true);

		try {
			const response = await api.post('/account/login', {
				email: emailValue,
				password: passwordValue,
			});
			console.log('Login successful:', response.data.user);
			// onSignIn(response.data);
		} catch (error) {
			console.log(
				'Login failed:',
				error.response?.data?.errors || error.message,
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='p-8'>
			<h2 className='text-2xl font-semibold text-gray-800 mb-6'>Login</h2>
			<form onSubmit={handleFormSubmit} className='space-y-4'>
				<Input
					label='Email'
					labelStyle={
						'block text-sm font-medium text-gray-500 mb-1 group-focus-within:text-blue-600'
					}
					id='email'
					type='email'
					name='email'
					inputStyle={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-500`}
					error={emailHasError && 'Please enter a valid email'}
					onBlur={handleEmailBlur}
					onChange={handleEmailChange}
					value={emailValue}
					placeholder='Enter your email'
				/>
				<PasswordInput
					labelStyle={
						'block text-sm font-medium text-gray-500 mb-1 group-focus-within:text-blue-600'
					}
					inputStyle={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-500 pr-12`}
					error={passwordHasError && `Password is invalid`}
					onBlur={handlePasswordBlur}
					onChange={handlePasswordChange}
					value={passwordValue}
					placeholder='Enter your password'
					name='password'
				/>
				<button
					type='submit'
					className='w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'>
					{loading ? 'Logging in...' : 'Login'}
				</button>
			</form>
			<div className='mt-6 text-center'>
				<button
					onClick={onSwitchToRegister}
					className='text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200'>
					Create a new account
				</button>
			</div>
		</div>
	);
};

export default Login;
