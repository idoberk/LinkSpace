import {
	Navigate,
	Route,
	BrowserRouter as Router,
	Routes,
} from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Statistics from './pages/Statistics';
import WelcomePage from './pages/WelcomePage';
import RequireAuth from './components/RequireAuth';
import Groups from './pages/Groups';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import { UserProvider } from './contexts/UserContext.jsx';
import Messages from './pages/Messages';
import ProtectedLayout from './components/ProtectedLayout';
import Canvas from './pages/Canvas';

import Users from './pages/Users';

const App = () => {
	return (
		<UserProvider>
			<Router>
				<Routes>
					<Route
						path='/'
						element={<Navigate to='/login' replace />}
					/>

					{/* Public-only routes */}
					<Route element={<PublicOnlyRoute />}>
						<Route path='/login' element={<WelcomePage />} />
						<Route path='/register' element={<WelcomePage />} />
					</Route>

					{/* Protected routes group */}
					<Route element={<RequireAuth />}>
						<Route element={<ProtectedLayout />}>
							<Route path='/home' element={<Home />} />
							<Route path='/profile' element={<Profile />} />
							<Route path='/groups' element={<Groups />} />
							<Route
								path='/statistics'
								element={<Statistics />}
							/>
							<Route path='/messages' element={<Messages />} />
							<Route path='/users' element={<Users />} />
							<Route path='canvas' element={<Canvas />} />
						</Route>
					</Route>
				</Routes>
			</Router>
		</UserProvider>
	);
};

export default App;
