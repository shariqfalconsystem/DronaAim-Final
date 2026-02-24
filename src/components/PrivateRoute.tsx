// components/PrivateRoute.tsx

import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { paths } from '../common/constants/routes';

interface PrivateRouteProps {
  path?: string;
  element: React.ReactNode;
  isAuthenticated: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ path, element, isAuthenticated }) => {
  return isAuthenticated ? <Route path={path} element={element} /> : <Navigate to={paths.LOGIN} replace />;
};

export default PrivateRoute;
