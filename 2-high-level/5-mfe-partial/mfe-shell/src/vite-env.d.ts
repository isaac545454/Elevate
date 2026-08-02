/// <reference types="vite/client" />

declare module 'mfe_vue/Card' {
  export function mount(container: HTMLElement): () => void
}

declare module 'mfe_react/Card' {
  export function mount(container: HTMLElement): () => void | Promise<() => void>
}

declare module 'mfe_angular/Card' {
  export function mount(container: HTMLElement): () => void | Promise<() => void>
}
