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
<<<<<<< HEAD
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
				<Route path='/profile' element={<Profile />} />
				<Route path='/profile/:userId' element={<Profile />} />
				<Route path='/groups' element={<GroupsDisplay />} />
				<Route path='/create-group' element={<CreateGroup />} />
				<Route path='/statistics' element={<Statistics />} />
			</Routes>
		</Router>
=======
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
>>>>>>> 142e6ab1b85b612ca5cedbf32f59bd5602b9cb90
	);
};

export default App;
