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
// import GroupsDisplay from './components/GroupsDisplay';
import Groups from './pages/Groups';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import { UserProvider } from './contexts/UserContext.jsx';
import Messages from './pages/Messages';
import ProtectedLayout from './components/ProtectedLayout';

// FIXME: Check why profile pictures are updating for friends too.
// TODO: Add messages implementation.
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
								path='/create-group'
								element={<CreateGroup />}
							/>
							<Route
								path='/statistics'
								element={<Statistics />}
							/>
							<Route path='/messages' element={<Messages />} />
							<Route path='/users' element={<Users />} />
						</Route>
					</Route>
				</Routes>
			</Router>
		</UserProvider>
	);
};

export default App;
