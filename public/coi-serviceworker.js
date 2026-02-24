/*! COEP Service Worker with improved cross-origin handling */

// Service Worker Context
if (typeof window === 'undefined') {
  // External media domains list
  let externalMediaDomains = [
    'is.smartwitness.co',
    // Add other video domains here
  ];

  // Listen for messages from the main thread
  self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'configureExternalMedia') {
      if (event.data.domains && Array.isArray(event.data.domains)) {
        externalMediaDomains = event.data.domains;
        console.log('Service worker updated external media domains:', externalMediaDomains);
      }
    }
  });

  self.addEventListener('install', () => self.skipWaiting());
  self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

  self.addEventListener('fetch', function (event) {
    const request = event.request;
    const url = new URL(request.url);

    // Skip if cache mode is 'only-if-cached' and mode is not 'same-origin'
    if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') {
      return;
    }

    // Check if this is an external media resource
    const isExternalMedia = externalMediaDomains.some((domain) => url.hostname.includes(domain));

    // Also check if the request is for a video file by extension
    const isVideoFile = /\.(mp4|webm|ogg|mov|avi)$/i.test(url.pathname);

    // For external media and video files, we need a special approach
    if (isExternalMedia || isVideoFile) {
      // For external media, we'll use a proxy approach
      // We'll fetch without modifying the request, then handle the response separately
      event.respondWith(
        fetch(request)
          .then((response) => {
            // If it's successful, don't try to modify (which can cause CORS issues)
            // Just pass it through as-is
            return response;
          })
          .catch((error) => {
            console.error('Failed to fetch external media:', url.toString(), error);
            throw error;
          })
      );
      return;
    }

    // For all other requests (non-video content), apply standard COEP headers
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 0) {
            return response;
          }

          const newHeaders = new Headers(response.headers);

          // Apply strict COEP headers for main document and resources
          newHeaders.set('Cross-Origin-Embedder-Policy', 'credentialless');
          newHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');

          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders,
          });
        })
        .catch((error) => {
          console.error('Fetch error:', error, 'URL:', request.url);
          throw error;
        })
    );
  });
}
