import { useState } from 'react';

import Input from '../components/Input';
import api from '../lib/axios';
import { useInput } from '../hooks/useInput';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import {
	MAX_FIRST_LAST_NAME_LENGTH,
	MIN_FIRST_LAST_NAME_LENGTH,
	MIN_PASS_LENGTH,
} from '../utils/constants';
import { hasMinLength, isEmail, isValidName } from '../utils/validation';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';

// const initialFormState = {
// 	errors: null,
// 	enteredValues: {
// 		email: '',
// 		password: '',
// 		firstName: '',
// 		lastName: '',
// 	},
// };

// const Register = ({ onSwitchToLogin }) => {
const Register = () => {
	const navigate = useNavigate();

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

	const {
		value: firstNameValue,
		handleInputChange: handleFirstNameChange,
		handleInputBlur: handleFirstNameBlur,
		hasError: firstNameHasError,
	} = useInput('', (value) =>
		isValidName(
			value,
			MIN_FIRST_LAST_NAME_LENGTH,
			MAX_FIRST_LAST_NAME_LENGTH,
		),
	);

	const {
		value: lastNameValue,
		handleInputChange: handleLastNameChange,
		handleInputBlur: handleLastNameBlur,
		hasError: lastNameHasError,
	} = useInput('', (value) =>
		isValidName(
			value,
			MIN_FIRST_LAST_NAME_LENGTH,
			MAX_FIRST_LAST_NAME_LENGTH,
		),
	);

	const [loading, setLoading] = useState(false);
	const [apiErrors, setApiErrors] = useState({});

	const getNameError = (value, fieldName) => {
		if (!value.trim()) return `${fieldName} is required`;
		if (value.length < MIN_FIRST_LAST_NAME_LENGTH) {
			return `${fieldName} must be at least ${MIN_FIRST_LAST_NAME_LENGTH} characters`;
		}
		if (value.length > MAX_FIRST_LAST_NAME_LENGTH) {
			return `${fieldName} cannot exceed ${MAX_FIRST_LAST_NAME_LENGTH} characters`;
		}
		if (!/^[a-zA-Z]+$/.test(value)) {
			return `${fieldName} must contain only letters`;
		}
		return null;
	};

	const handleFormSubmit = async (e) => {
		e.preventDefault();

		if (
			emailHasError ||
			passwordHasError ||
			firstNameHasError ||
			lastNameHasError
		) {
			return;
		}

		if (
			!emailValue ||
			!passwordValue ||
			!firstNameValue ||
			!lastNameValue
		) {
			return;
		}

		setLoading(true);
		setApiErrors({});

		try {
			const response = await api.post('/account/register', {
				email: emailValue,
				password: passwordValue,
				firstName: firstNameValue,
				lastName: lastNameValue,
			});
			console.log('Registration successful:', response.data);
			navigate('/login');
		} catch (error) {
			console.log(
				'Registration failed:',
				error.response?.data?.errors || error.message,
			);

			if (error.response?.data?.errors) {
				setApiErrors(error.response.data.errors);
			} else {
				setApiErrors({
					general:
						error.response?.data?.message ||
						'Registration failed. Please try again.',
				});
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='p-8'>
			<h2 className='text-2xl font-semibold text-gray-800 mb-6'>
				Create Account
			</h2>
			<form onSubmit={handleFormSubmit} className='space-y-4'>
				<div className='grid grid-cols-2 gap-4'>
					<Input
						label='First Name'
						labelStyle={
							'block text-sm font-medium text-gray-500 mb-1 group-focus-within:text-blue-600 transition-colors duration-200'
						}
						id='firstName'
						type='text'
						name='firstName'
						inputStyle={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-500`}
						error={
							(firstNameHasError &&
								getNameError(firstNameValue, 'First name')) ||
							apiErrors.firstName
						}
						onBlur={handleFirstNameBlur}
						onChange={handleFirstNameChange}
						value={firstNameValue}
						placeholder='John'
						minLength='2'
						required
					/>
					<Input
						label='Last Name'
						labelStyle={
							'block text-sm font-medium text-gray-500 mb-1 group-focus-within:text-blue-600 transition-colors duration-200'
						}
						id='lastName'
						type='text'
						name='lastName'
						inputStyle={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-500`}
						error={
							(lastNameHasError &&
								getNameError(lastNameValue, 'Last name')) ||
							apiErrors.lastName
						}
						onBlur={handleLastNameBlur}
						onChange={handleLastNameChange}
						value={lastNameValue}
						placeholder='Doe'
						required
					/>
				</div>
				<Input
					label='Email'
					labelStyle={
						'block text-sm font-medium text-gray-500 mb-1 group-focus-within:text-blue-600'
					}
					id='email'
					type='email'
					name='email'
					inputStyle={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-500`}
					error={
						(emailHasError && 'Please enter a valid email') ||
						apiErrors.email
					}
					onBlur={handleEmailBlur}
					onChange={handleEmailChange}
					value={emailValue}
					placeholder='john.doe@example.com'
					required
				/>
				<Input
					label='Password'
					labelStyle={
						'block text-sm font-medium text-gray-500 mb-1 group-focus-within:text-blue-600'
					}
					id='password'
					type='password'
					name='password'
					inputStyle={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-500`}
					error={
						(passwordHasError &&
							`Password must contain at least ${MIN_PASS_LENGTH} characters`) ||
						apiErrors.password
					}
					onBlur={handlePasswordBlur}
					onChange={handlePasswordChange}
					value={passwordValue}
					placeholder={`At least ${MIN_PASS_LENGTH} characters`}
					required
				/>
				<PasswordStrengthIndicator password={passwordValue} />

				{apiErrors.general && (
					<p className='text-sm text-red-600 text-center'>
						{apiErrors.general}
					</p>
				)}

				<Button type='submit' disabled={loading}>
					{loading ? 'Creating account...' : 'Register'}
				</Button>
			</form>
			<div className='text-center'>
				<Button onClick={() => navigate('/login')}>
					Already have an account? Login
				</Button>
			</div>
		</div>
	);
};

export default Register;
