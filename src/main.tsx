import './index.css';
import { init as sentryInit } from '@sentry/react';
// import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

sentryInit({
  dsn: 'https://f7955000a5929d11ff4c6e6d47826169@o4509480519991296.ingest.de.sentry.io/4509480521891920',
  sendDefaultPii: true,
  allowUrls: ['https://ikuyo.kenrick95.org'],
});

/** Delete all service worker generated from previous build tooling... It was kind of unnecessarily complicated since fetching data still need internet connection, maybe we don't need it for now... */
async function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    if (navigator.serviceWorker.getRegistrations) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        console.log('Unregistering service worker for:', reg.scope);
        await reg.unregister();
      }
    } else {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        console.log('Unregistering service worker');
        await registration.unregister();
      }
    }
  }
}
setTimeout(() => {
  unregisterServiceWorker().catch((error) => {
    console.error('Failed to unregister service worker:', error);
  });
}, 1000);

createRoot(document.getElementById('root') as HTMLDivElement).render(
  // <StrictMode>
  <App />,
  // </StrictMode>,
);
