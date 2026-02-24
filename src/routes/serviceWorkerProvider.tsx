import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { configureForCurrentRoute } from '../utility/serviceWorkerManager';

/**
 * Service Worker Provider Component
 *
 * This component detects route changes in React Router and
 * configures the service worker accordingly.
 */
export function ServiceWorkerProvider({ children }: any) {
  const location = useLocation();

  useEffect(() => {
    // Configure service worker when route changes
    configureForCurrentRoute();
  }, [location.pathname]);

  return children;
}
