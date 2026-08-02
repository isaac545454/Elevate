import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initEventBus } from '../../shared/event-bus'
import Card from './Card'
import './card.css'
import './dev.css'

initEventBus()

const root = document.getElementById('root')!
root.innerHTML = `
  <div class="dev-preview dev-preview--react">
    <div class="dev-preview__banner">
      <strong>Porta 5002 — Pokémon (React)</strong><br />
      Preview isolado. Container completo: <a href="http://localhost:5000">localhost:5000</a>
    </div>
    <div class="dev-preview__content" id="mount"></div>
  </div>
`
createRoot(document.getElementById('mount')!).render(
  <StrictMode>
    <Card />
  </StrictMode>,
)
