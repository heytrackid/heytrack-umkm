import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// Check if running in development and show console log
if (import.meta.env.DEV) {
  console.log('🎯 HeyTrack started in development mode');
  console.log('Environment:', {
    NODE_ENV: import.meta.env.MODE,
    BUILD_ID: import.meta.env.VITE_BUILD_ID,
    COMMIT_HASH: import.meta.env.VITE_COMMIT_HASH,
    BUILD_TIME: import.meta.env.VITE_BUILD_TIME,
    APP_NAME: import.meta.env.VITE_APP_NAME,
    APP_VERSION: import.meta.env.VITE_APP_VERSION
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);