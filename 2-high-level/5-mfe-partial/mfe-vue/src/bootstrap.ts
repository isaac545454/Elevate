import { createApp, type App } from 'vue'
import Card from './Card.vue'
import './card.css'

export function mount(container: HTMLElement): () => void {
  const app: App = createApp(Card)
  app.mount(container)
  return () => app.unmount()
}
