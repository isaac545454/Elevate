import { createApp } from 'vue'
import { initEventBus } from '../../shared/event-bus'
import Card from './Card.vue'
import './card.css'
import './dev.css'

initEventBus()

const root = document.getElementById('app')!
root.innerHTML = `
  <div class="dev-preview dev-preview--vue">
    <div class="dev-preview__banner">
      <strong>Porta 5001 — JSONPlaceholder (Vue)</strong><br />
      Preview isolado. Container completo: <a href="http://localhost:5000">localhost:5000</a>
    </div>
    <div class="dev-preview__content" id="mount"></div>
  </div>
`
createApp(Card).mount('#mount')
