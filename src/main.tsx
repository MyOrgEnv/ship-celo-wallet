import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { WagmiProvider } from './providers/WagmiProvider';
import { registerServiceWorker } from './utils/pwa';

// Register service worker for PWA functionality
registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider>
      <App />
    </WagmiProvider>
  </StrictMode>
);
