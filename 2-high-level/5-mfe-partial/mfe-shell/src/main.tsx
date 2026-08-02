import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { attachShellEventLogger, initEventBus } from '../../shared/event-bus'
import './app.css'

initEventBus()
attachShellEventLogger()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
