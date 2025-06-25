import { useState } from 'react';
import api from '../lib/axios';

export default function SignIn({ onSwitchToSignUp }) {
	const [formData, setFormData] = useState({
		email: '',
		password: '',
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
			const response = await api.post('/account/login', formData);
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
			<h2 className='text-2xl font-semibold text-gray-800 mb-6'>
				Sign In
			</h2>
			<div className='space-y-4'>
				<div className='relative group'>
					<label
						htmlFor='signin-email'
						className='block text-sm font-medium text-gray-500 mb-1 group-focus-within:text-blue-600'>
						Email
					</label>
					<input
						type='email'
						id='signin-email'
						name='email'
						autoComplete='off'
						value={formData.email}
						onChange={handleInputChange}
						className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-500`}
						placeholder='Enter your email'
					/>
				</div>
				<div className='relative group'>
					<label
						htmlFor='signin-password'
						className='block text-sm font-medium text-gray-500 mb-1 group-focus-within:text-blue-600'>
						Password
					</label>
					<input
						type='password'
						id='signin-password'
						name='password'
						value={formData.password}
						onChange={handleInputChange}
						className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-500`}
						placeholder='Enter your password'
					/>
				</div>
			</div>
			<button
				onClick={handleFormSubmit}
				disabled={loading || !formData.email || !formData.password}
				className='w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'>
				{loading ? 'Signing in...' : 'Sign In'}
			</button>
			<div className='mt-6 text-center'>
				<button
					onClick={onSwitchToSignUp}
					className='text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200'>
					Create a new account
				</button>
			</div>
		</div>
	);
}
