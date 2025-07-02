import { useState } from 'react';
import Input from './Input';
import { useInput } from '../hooks/useInput';
import api from '../lib/axios';
import { isEmail, hasMinLength, notEmpty } from '../utils/validation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { MIN_PASS_LENGTH } from '../utils/constants';
import { PasswordInput } from './PasswordInput';
import  Button  from './Button';
import { useNavigate } from 'react-router-dom';


// const Login = ({ onSwitchToRegister }) => {
const Login = () => {
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
	const [showPassword, setShowPassword] = useState(false);

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
			navigate('/home');
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

	const isFormValid = notEmpty(emailValue) && notEmpty(passwordValue);

	const navigate = useNavigate();

	const toggleShowPassword = () => {
		setShowPassword(!showPassword);
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
				{/* <div className='relative'>
					<Input
						label='Password'
						labelStyle={
							'block text-sm font-medium text-gray-500 mb-1 group-focus-within:text-blue-600'
						}
						id='password'
						type={showPassword ? 'text' : 'password'}
						name='password'
						inputStyle={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-500 pr-10`}
						error={passwordHasError && `Password is invalid`}
						onBlur={handlePasswordBlur}
						onChange={handlePasswordChange}
						value={passwordValue}
						placeholder='Enter your password'
					/>
					<button
						type='button'
						onClick={toggleShowPassword}
						className='absolute right-3 top-[calc(50%+0.5rem)] -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none'
						aria-label={
							showPassword ? 'Hide password' : 'Show password'
						}>
						<FontAwesomeIcon
							icon={showPassword ? faEyeSlash : faEye}
							className='w-5 h-5'
						/>
					</button>
				</div> */}
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
				<Button type='submit' disabled={!isFormValid}>
					{loading ? 'Logging in...' : 'Login'}
					
				</Button>
				{/* <button
					type='submit'
					className='w-full mt-6 bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'>
					{loading ? 'Logging in...' : 'Login'}
				</button> */}
			</form>
			<div className='mt-6 text-center'>
				{/* <Button onClick={onSwitchToRegister}> */}
				<Button onClick={() => navigate('/register')}>
					Create a new account
				</Button>
				{/* <button
					onClick={onSwitchToRegister}
					className='text-indigo-500 hover:text-blue-800 font-medium transition-colors duration-200'>
					Create a new account
				</button> */}
			</div>
		</div>
	);
};

export default Login;
