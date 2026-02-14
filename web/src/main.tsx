import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initSentry } from './lib/sentry'
import { initPostHog } from './lib/posthog'
import './design-system/tokens.css'
import './design-system/components.css'
import './design-system/layout.css'
import './design-system/animations.css'
import './index.css'
import App from './App.tsx'

// Initialize observability (no-ops if env vars are absent)
initSentry()
initPostHog()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
