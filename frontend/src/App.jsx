import { useState } from 'react';
import api from './lib/axios';

export default function App() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);

	const handleLogin = async () => {
		setLoading(true);

		try {
			const res = await api.post('/account/login', {
				email,
				password,
			});

			console.log('Login successful', {
				message: res.data.message,
				token: res.data.token,
				user: res.data.user,
			});
		} catch (error) {
			if (error.response) {
				console.log('Login failed:', error.response.data.errors);
			} else {
				console.log('Network error:', error.message);
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<div>
				<h1>Login to LinkSpace</h1>
				<div>
					<div>
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
					</button>
				</div>
			</div>
		</div>
	);
}
