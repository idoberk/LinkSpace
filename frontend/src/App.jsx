import { useState } from 'react';
import api from './lib/axios';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';

export default function App() {
	const [isSignUp, setIsSignUp] = useState(false);
	// const [email, setEmail] = useState('');
	// const [password, setPassword] = useState('');
	// const [loading, setLoading] = useState(false);

	// const handleLogin = async () => {
	// 	setLoading(true);

	// 	try {
	// 		const res = await api.post('/account/login', {
	// 			email,
	// 			password,
	// 		});

	// 		console.log('Login successful', {
	// 			message: res.data.message,
	// 			token: res.data.token,
	// 			user: res.data.user,
	// 		});
	// 	} catch (error) {
	// 		if (error.response) {
	// 			console.log('Login failed:', error.response.data.errors);
	// 		} else {
	// 			console.log('Network error:', error.message);
	// 		}
	// 	} finally {
	// 		setLoading(false);
	// 	}
	// };

	const handleSwitchForms = () => {
		setIsSignUp(!isSignUp);
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
			<div className='max-w-md w-full'>
				<div className='text-center mb-8'>
					<h1
						className='text-5xl font-bold text-gray-800 mb-2'
						style={{
							textShadow: '4px 4px 1px rgba(50,50,50,0.3)',
						}}>
						LinkSpace
					</h1>
					<p className='text-gray-600 text-lg'>
						Connect with friends and the world around you!
					</p>
				</div>
				<div
					className='bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-500 ease-in-out'
					style={{ minHeight: '380px' }}>
					{/* <div>
						<label>Email</label>
						<input
							type='email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</div>
					<div>
						<label>Password</label>
						<input
							type='password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>
					<button
						onClick={handleLogin}
						disabled={loading || !email || !password}>
						{loading ? 'Logging in...' : 'Login'}
					</button> */}
					{!isSignUp ? (
						<SignIn onSwitchToSignUp={handleSwitchForms} />
					) : (
						<SignUp onSwitchToSignIn={handleSwitchForms} />
					)}
				</div>
			</div>
		</div>
	);
}
