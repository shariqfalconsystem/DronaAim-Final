import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { paths } from '../common/constants/routes';
import { fetchAuthSession } from 'aws-amplify/auth';
import LoadingScreen from '../components/molecules/loading-screen';
import { useSelector } from 'react-redux';

interface PrivateRouteProps {
  allowedRoles?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRoles }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const location = useLocation();

  const role = useSelector((state: any) => state.auth.currentUserRole);
  const isActive = useSelector(
    (state: any) => state?.auth?.userData?.selectedRole?.policyDetails?.[0]?.isActive || false
  );

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await fetchAuthSession();
        setIsAuthenticated(!!session?.tokens?.accessToken);
        setUserRole(role);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, [role]);

  if (isAuthenticated === null) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to={paths.LOGIN} />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole || '')) {
    return <Navigate to={paths.LOGIN} />;
  }

  // Check if policy is expired for fleet manager roles
  const isFleetManagerRole = ['fleetManager', 'fleetManagerSuperUser'].includes(userRole || '');
  const isPolicyExpired = !isActive;

  // If policy is expired and user is a fleet manager trying to access any route other than dashboard
  if (isFleetManagerRole && isPolicyExpired && location.pathname !== paths.DASHBOARD) {
    return <Navigate to={paths.DASHBOARD} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
