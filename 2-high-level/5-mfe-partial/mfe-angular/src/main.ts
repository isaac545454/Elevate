import { initEventBus } from '../../shared/event-bus'
import { mount } from './bootstrap'
import './card.css'
import './dev.css'

initEventBus()

const root = document.getElementById('app')!
root.innerHTML = `
  <div class="dev-preview dev-preview--angular">
    <div class="dev-preview__banner">
      <strong>Porta 5003 — Rick and Morty (Angular)</strong><br />
      Preview isolado. Container completo: <a href="http://localhost:5000">localhost:5000</a>
    </div>
    <div class="dev-preview__content" id="mount"></div>
  </div>
`
mount(document.getElementById('mount')!)
