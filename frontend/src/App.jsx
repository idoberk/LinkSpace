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
import CreateGroup from './components/CreateGroup';
import RequireAuth from './components/RequireAuth';
import GroupsDisplay from './components/GroupsDisplay';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import { UserProvider } from './contexts/UserContext.jsx';

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
						<Route path='/home' element={<Home />} />
						<Route path='/profile' element={<Profile />} />
						<Route path='/groups' element={<GroupsDisplay />} />
						<Route path='/create-group' element={<CreateGroup />} />
						<Route path='/statistics' element={<Statistics />} />
					</Route>
				</Routes>
			</Router>
		</UserProvider>
	);
};

export default App;
