if (typeof window === 'undefined') {
  let externalMediaDomains = ['is.smartwitness.co', 'sv.smartwitness.co'];

  self.addEventListener('message', (event) => {
    console.log('event>>>>>>>>> : ', event);
    if (event.data?.type === 'configureExternalMedia') {
      if (Array.isArray(event.data.domains)) {
        externalMediaDomains = event.data.domains;
        console.log('Updated external media domains:', externalMediaDomains);
      }
    }
  });

  self.addEventListener('install', () => self.skipWaiting());
  self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

  self.addEventListener('fetch', function (event) {
    const { request } = event;
    const url = new URL(request.url);

    const isExternalMedia = externalMediaDomains.some((domain) => url.hostname.includes(domain));
    const isVideoFile = /\.(mp4|webm|ogg|mov|avi)$/i.test(url.pathname);

    // ✅ Bypass the service worker for external media completely
    if (isExternalMedia || isVideoFile) {
      return; // Let the browser fetch directly
    }

    // For other requests, apply COEP/COOP headers
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (
            response.status === 0 ||
            response.type === 'opaque' ||
            request.destination === 'video' ||
            request.destination === 'audio' ||
            request.destination === 'image'
          ) {
            return response;
          }

          const newHeaders = new Headers(response.headers);
          newHeaders.set('Cross-Origin-Embedder-Policy', 'unsafe-none');
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
