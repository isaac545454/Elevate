import { createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import Card from './Card'
import './card.css'

export function mount(container: HTMLElement): () => void {
  const root: Root = createRoot(container)
  root.render(createElement(Card))
  return () => root.unmount()
}
