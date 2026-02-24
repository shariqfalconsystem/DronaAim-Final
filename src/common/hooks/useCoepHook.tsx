import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * React hook to manage COEP settings based on current route
 */
export function useCoepRouteSettings() {
  const location = useLocation();
  
  useEffect(() => {
    // Routes where COEP should be disabled (PowerBI routes)
    const powerBiRoutes = ['/insurer/reports', '/reports'];
    
    // Check if current path matches any PowerBI route
    const isPowerBiRoute = powerBiRoutes.some(route => 
      location.pathname.includes(route)
    );

    // Send message to service worker about route change
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      console.log(`Route changed to: ${location.pathname} (PowerBI: ${isPowerBiRoute})`);
      
      // Inform service worker about current route
      navigator.serviceWorker.controller.postMessage({
        type: 'routeChanged',
        path: location.pathname
      });
      
      // Set appropriate COEP mode
      navigator.serviceWorker.controller.postMessage({
        type: 'coepCredentialless',
        value: !isPowerBiRoute,
      });
      
      // Update routes where COEP should be disabled
      navigator.serviceWorker.controller.postMessage({
        type: 'updateDisableRoutes',
        routes: powerBiRoutes,
      });
    }
  }, [location.pathname]);
}