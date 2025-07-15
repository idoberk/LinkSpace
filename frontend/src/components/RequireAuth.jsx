import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { isAuthenticated, removeToken } from '../utils/auth';

const RequireAuth = () => {
	const location = useLocation();

	if (!isAuthenticated()) {
		removeToken(); // Clean up expired token
		return <Navigate to='/login' state={{ from: location }} replace />;
	}

	return <Outlet />;
};

export default RequireAuth;
