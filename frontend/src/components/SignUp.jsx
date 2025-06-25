import { useState, useActionState } from 'react';
import api from '../lib/axios';

const initialFormState = {
	errors: null,
	enteredValues: {
		email: '',
		password: '',
		firstName: '',
		lastName: '',
	},
};

export default function SignUp({ onSwitchToSignIn }) {
	async function submitSignUpAction(prevFormState, formData) {
		const email = formData.get('email');
		const password = formData.get('password');
		const firstName = formData.get('firstName');
		const lastName = formData.get('lastName');

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

		return { errors: null };
	}

	const [formState, formAction, isPending] = useActionState(
		submitSignUpAction,
		initialFormState,
	);

	/* const [formData, setFormData] = useState({
		email: '',
		password: '',
		firstName: '',
		lastName: '',
	});
	const [loading, setLoading] = useState(false);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleFormSubmit = async () => {
		setLoading(true);

		try {
			const response = await api.post('/account/register', formData);
			console.log('Registration successful:', response.data);
			// onSignIn(response.data);
		} catch (error) {
			console.log(
				'Registration failed:',
				error.response?.data?.errors || error.message,
			);
		} finally {
			setLoading(false);
		}
	}; */

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
				<div className='relative group'>
					<label
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
					/>
				</div>
				<div className='relative group'>
					<label
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
						placeholder='At least 6 characters'
					/>
				</div>
				<button
					type='submit'
					//onClick={handleFormSubmit}
					className='w-full mb-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
					disabled={isPending}>
					{isPending ? 'Creating account...' : 'Sign Up'}
				</button>
			</form>
			<div className='text-center'>
				<button
					onClick={onSwitchToSignIn}
					className='text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200'>
					Already have an account? Sign in
				</button>
			</div>
		</div>
	);
}
