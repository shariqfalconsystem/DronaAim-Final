/**
 * Service Worker Manager
 * This utility dynamically manages service worker registration/unregistration
 * based on the current route.
 */

// Routes that need COEP (video management routes)
const VIDEO_MANAGEMENT_ROUTES = ['/dashcam-footage'];

// Check if the current route is a video management route
function isInVideoManagementRoute() {
  return VIDEO_MANAGEMENT_ROUTES.some((route) => window.location.pathname.includes(route));
}

// Register the service worker
async function registerServiceWorker() {
  if (!navigator.serviceWorker) {
    console.warn('Service Worker API not available');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/coi-serviceworker.js');
    console.log('COEP Service Worker registered successfully', registration.scope);

    // Wait for the service worker to be activated
    if (registration.installing) {
      const serviceWorker = registration.installing || registration.waiting;

      await new Promise((resolve) => {
        serviceWorker.addEventListener('statechange', (e) => {
          if (e.target.state === 'activated') {
            resolve();
          }
        });
      });
    }

    // Tell the service worker about any known video domains
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'configureExternalMedia',
        domains: ['is.smartwitness.co', 'sv.smartwitness.co'], // Add all domains that serve videos
      });
    }

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

// Unregister any existing service worker
async function unregisterServiceWorker() {
  if (!navigator.serviceWorker) return false;

  try {
    // Check if there are any registrations
    const registrations = await navigator.serviceWorker.getRegistrations();

    // Unregister all service workers
    const results = await Promise.all(registrations.map((registration) => registration.unregister()));

    // If any service worker was unregistered
    if (results.some((result) => result === true)) {
      console.log('Service Worker successfully unregistered');
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error unregistering Service Worker:', error);
    return false;
  }
}

// Configure service worker based on current route
async function configureForCurrentRoute(forceReload = false) {
  const inVideoManagementRoute = isInVideoManagementRoute();

  // Store the current state to detect changes
  const currentlyHasController = !!navigator.serviceWorker.controller;

  // Only enable the service worker for video management routes
  if (inVideoManagementRoute) {
    console.log('Video management route detected - enabling service worker');

    // Check if service worker is already controlling the page
    if (!currentlyHasController) {
      const registration = await registerServiceWorker();

      // If we just registered the service worker, we need to reload
      if (registration || forceReload) {
        console.log('Service worker registered, reloading...');
        window.location.reload();
        return;
      }
    } else {
      // If the service worker is already controlling the page, make sure it's updated
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'configureExternalMedia',
          domains: ['is.smartwitness.co', 'sv.smartwitness.co'], // Add all domains that serve videos
        });
      }
    }
  } else {
    // For all other routes, unregister the service worker
    console.log('Non-video management route detected - disabling service worker');
    const wasUnregistered = await unregisterServiceWorker();

    // If service worker was active and unregistered, we need to reload
    if ((wasUnregistered && currentlyHasController) || forceReload) {
      console.log('Service worker was controlling the page, reloading...');
      window.location.reload();
      return;
    }
  }
}

// Initialize based on first page load
export async function initServiceWorkerManager() {
  // If this is the first load after a service worker change, it might be needed to force a reload
  const needsReset = sessionStorage.getItem('sw_needs_reset');
  if (needsReset) {
    sessionStorage.removeItem('sw_needs_reset');
    await configureForCurrentRoute(true);
  } else {
    await configureForCurrentRoute();
  }
}

// Handle route changes in SPA
export function setupRouteChangeListener() {
  // For React Router or other SPAs that don't trigger actual navigation
  let lastPathname = window.location.pathname;

  // Check periodically for route changes
  setInterval(() => {
    const currentPathname = window.location.pathname;
    if (currentPathname !== lastPathname) {
      console.log(`Route changed from ${lastPathname} to ${currentPathname}`);
      lastPathname = currentPathname;

      // Store a flag that we're transitioning between routes
      const wasInVideoManagementRoute = VIDEO_MANAGEMENT_ROUTES.some((route) => lastPathname.includes(route));
      const isNowInVideoManagementRoute = VIDEO_MANAGEMENT_ROUTES.some((route) => currentPathname.includes(route));

      // Only force reload if we're switching between video management and non-video management routes
      if (wasInVideoManagementRoute !== isNowInVideoManagementRoute) {
        sessionStorage.setItem('sw_needs_reset', 'true');
      }

      configureForCurrentRoute();
    }
  }, 300);
}

// Exports for direct use
export { configureForCurrentRoute, registerServiceWorker, unregisterServiceWorker, isInVideoManagementRoute };
