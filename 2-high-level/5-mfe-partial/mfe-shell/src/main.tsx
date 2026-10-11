import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import {
  attachNativeShellBridge,
  attachShellEventLogger,
  initEventBus,
} from '../../shared/event-bus'
import './app.css'

initEventBus()
attachShellEventLogger()
attachNativeShellBridge()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
