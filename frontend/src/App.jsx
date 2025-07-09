// import { useState } from 'react';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import WelcomePage from './pages/WelcomePage';
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from 'react-router-dom';

const App = () => {
	return (
		<Router>
			<Routes>
				<Route path='/' element={<Navigate to='/login' replace />} />
				<Route
					path='/login'
					element={
						<WelcomePage>
							<Login />
						</WelcomePage>
					}
				/>
				<Route
					path='/register'
					element={
						<WelcomePage>
							<Register />
						</WelcomePage>
					}
				/>
				<Route path='/home' element={<Home />} />
			</Routes>
		</Router>
	);
};

export default App;
