import { useActionState } from 'react';
import Input from './Input';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { MIN_PASS_LENGTH } from '../utils/constants';
import api from '../lib/axios';
import { useInput } from '../hooks/useInput';
import { hasMinLength, isEmail, notEmpty } from '../utils/validation';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

const initialFormState = {
	errors: null,
	enteredValues: {
		email: '',
		password: '',
		firstName: '',
		lastName: '',
	},
};

// const Register = ({ onSwitchToLogin }) => {
const Register = () => {
	const {
		value: firstNameValue,
		handleInputChange: handleFirstNameChange,
		handleInputBlur: handleFirstNameBlur,
		hasError: firstNameHasError,
	} = useInput('', notEmpty);

	const {
		value: lastNameValue,
		handleInputChange: handleLastNameChange,
		handleInputBlur: handleLastNameBlur,
		hasError: lastNameHasError,
	} = useInput('', notEmpty);
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

	const isFormValid = notEmpty(emailValue) && notEmpty(passwordValue);

	const navigate = useNavigate();

	async function submitRegisterAction(prevFormState, formData) {
		const email = formData.get('email');
		const password = formData.get('password');
		const firstName = formData.get('firstName');
		const lastName = formData.get('lastName');
		// const email = emailValue;
		// const password = passwordValue;
		// const firstName = firstNameValue;
		// const lastName = lastNameValue;
		// const firstName = formData.get('firstName');
		// const lastName = formData.get('lastName');

		let errors = [];

		if (errors.length > 0) {
			return {
				errors,
				enteredValues: {
					email,
					password,
					firstName,
					lastName,
				},
			};
		}

		const response = await api.post('/account/register', {
			email,
			password,
			firstName,
			lastName,
		});

		console.log('Registration successful:', response.data);
		navigate('/home'); //maybe change to home

		return { errors: null };
	}

	const [formState, formAction, isPending] = useActionState(
		submitRegisterAction,
		initialFormState,
	);

	return (
		<div className='p-8'>
			<h2 className='text-2xl font-semibold text-gray-800 mb-6'>
				Create Account
			</h2>
			<form action={formAction} className='space-y-4'>
				<div className='grid grid-cols-2 gap-4'>
					<div className='relative group'>
						<label
							htmlFor='firstName'
							className='block text-sm font-medium text-gray-500 mb-1 group-focus-within:text-blue-600 transition-colors duration-200'>
							First Name
						</label>
						<input
							type='text'
							id='firstName'
							name='firstName'
							defaultValue={formState.enteredValues?.firstName}
							//onChange={handleInputChange}
							className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-500`}
							placeholder='John'
						/>
					</div>
					<div className='relative group'>
						<label
							htmlFor='lastName'
							className='block text-sm font-medium text-gray-500 mb-1 group-focus-within:text-blue-600'>
							Last Name
						</label>
						<input
							type='text'
							id='lastName'
							name='lastName'
							defaultValue={formState.enteredValues?.lastName}
							//onChange={handleInputChange}
							className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-500`}
							placeholder='Doe'
						/>
					</div>
				</div>

				{/* <label
						htmlFor='email'
						className='block text-sm font-medium text-gray-500 mb-1 group-focus-within:text-blue-600'>
						Email
					</label>
					<input
						type='email'
						id='email'
						name='email'
						defaultValue={formState.enteredValues?.email}
						//onChange={handleInputChange}
						autoComplete='off'
						className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-500`}
						placeholder='john.doe@example.com'
					/> */}
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
					placeholder='john.doe@example.com'
				/>

				{/* <label
						htmlFor='password'
						className='block text-sm font-medium text-gray-500 mb-1 group-focus-within:text-blue-600'>
						Password
					</label>
					<input
						type='password'
						id='password'
						name='password'
						defaultValue={formState.enteredValues?.password}
						//onChange={handleInputChange}
						className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-500`}
						placeholder=`At least ${MIN_PASS_LENGTH} characters`
					/> */}
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
						passwordHasError &&
						`Password must contain at least ${MIN_PASS_LENGTH} characters`
					}
					onBlur={handlePasswordBlur}
					onChange={handlePasswordChange}
					value={passwordValue}
					placeholder={`At least ${MIN_PASS_LENGTH} characters`}
				/>
				<PasswordStrengthIndicator password={passwordValue} />

				{/* <button
					type='submit'
					//onClick={handleFormSubmit}
					className='w-full mb-4 bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
					disabled={isPending}>
					{isPending ? 'Creating account...' : 'Register'}
				</button> */}
				<Button type='submit' disabled={isPending || !isFormValid}>
					{isPending ? 'Creating account...' : 'Register'}
				</Button>
			</form>
			<div className='text-center'>
				{/* <button
					onClick={onSwitchToLogin}
					className='text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200'>
					Already have an account? Login
				</button> */}
				<Button onClick={() => navigate('/login')}>
					Already have an account? Login
				</Button>
			</div>
		</div>
	);
};
