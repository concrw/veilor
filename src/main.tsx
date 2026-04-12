import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import App from './App.tsx'
import './index.css'
import { registerServiceWorker } from './utils/registerSW'
import { reportWebVitals } from './utils/reportWebVitals'

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.2,
    replaysOnErrorSampleRate: 1.0,
    integrations: [Sentry.replayIntegration({ maskAllText: true, blockAllMedia: false })],
  });
}

createRoot(document.getElementById("root")!).render(<App />);

// Register service worker for PWA
if (import.meta.env.PROD) {
  registerServiceWorker();
}

// Performance monitoring — Web Vitals (CLS, FID, LCP, FCP, TTFB, INP)
reportWebVitals();
