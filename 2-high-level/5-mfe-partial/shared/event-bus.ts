export type ViewableMfeId = 'jsonplaceholder' | 'pokemon' | 'rick'

export type NavEventName =
  | 'home-jsonplaceholder'
  | 'home-pokemon'
  | 'home-rick'

export type MfeEvents = {
  'home-jsonplaceholder': { mfeId: 'jsonplaceholder' }
  'home-pokemon': { mfeId: 'pokemon' }
  'home-rick': { mfeId: 'rick' }
}

export type MfeEventName = keyof MfeEvents

const NAV_EVENT_BY_MFE: Record<ViewableMfeId, NavEventName> = {
  jsonplaceholder: 'home-jsonplaceholder',
  pokemon: 'home-pokemon',
  rick: 'home-rick',
}

const MFE_BY_NAV_EVENT: Record<NavEventName, ViewableMfeId> = {
  'home-jsonplaceholder': 'jsonplaceholder',
  'home-pokemon': 'pokemon',
  'home-rick': 'rick',
}

type MfeEventBus = {
  on<Key extends MfeEventName>(type: Key, handler: (event: MfeEvents[Key]) => void): void
  off<Key extends MfeEventName>(type: Key, handler: (event: MfeEvents[Key]) => void): void
  emit<Key extends MfeEventName>(type: Key, event: MfeEvents[Key]): void
}

declare global {
  interface Window {
    __MFE_PLATFORM_EVENT_BUS__?: MfeEventBus
    __NATIVE_EMIT_NAV__?: (mfeId: ViewableMfeId) => void
  }
}

export const MFE_TARGETS: { id: ViewableMfeId; label: string; event: NavEventName }[] = [
  { id: 'jsonplaceholder', label: 'JSONPlaceholder', event: 'home-jsonplaceholder' },
  { id: 'pokemon', label: 'Pokémon', event: 'home-pokemon' },
  { id: 'rick', label: 'Rick and Morty', event: 'home-rick' },
]

function createEventBus(): MfeEventBus {
  const handlers = new Map<MfeEventName, Set<(event: MfeEvents[MfeEventName]) => void>>()

  return {
    on(type, handler) {
      let set = handlers.get(type)
      if (!set) {
        set = new Set()
        handlers.set(type, set)
      }
      set.add(handler as (event: MfeEvents[MfeEventName]) => void)
    },
    off(type, handler) {
      handlers.get(type)?.delete(handler as (event: MfeEvents[MfeEventName]) => void)
    },
    emit(type, event) {
      handlers.get(type)?.forEach((handler) => handler(event))
    },
  }
}

/** Inicializa o bus global (idempotente). Necessário no preview standalone de cada MFE. */
export function initEventBus(): void {
  if (typeof window === 'undefined') return
  if (!window.__MFE_PLATFORM_EVENT_BUS__) {
    window.__MFE_PLATFORM_EVENT_BUS__ = createEventBus()
  }
}

function getEventBus(): MfeEventBus {
  initEventBus()
  return window.__MFE_PLATFORM_EVENT_BUS__!
}

export const eventBus: MfeEventBus = {
  on: (type, handler) => getEventBus().on(type, handler),
  off: (type, handler) => getEventBus().off(type, handler),
  emit: (type, event) => {
    console.log('[MFE Event Bus] Evento enviado:', type, event)
    getEventBus().emit(type, event)
  },
}

/** Registra listeners de debug no shell para todos os eventos do bus. */
export function attachShellEventLogger(): void {
  ;(Object.keys(MFE_BY_NAV_EVENT) as NavEventName[]).forEach((type) => {
    eventBus.on(type, (event) => {
      console.log('[Shell] Evento recebido:', type, event)
    })
  })
}

export function onNavChange(handler: (mfeId: ViewableMfeId) => void) {
  const unsubscribers = (Object.keys(MFE_BY_NAV_EVENT) as NavEventName[]).map((type) => {
    const listener = () => handler(MFE_BY_NAV_EVENT[type])
    eventBus.on(type, listener)
    return () => eventBus.off(type, listener)
  })

  return () => unsubscribers.forEach((unsubscribe) => unsubscribe())
}

export function emitNavChange(mfeId: ViewableMfeId) {
  const type = NAV_EVENT_BY_MFE[mfeId]
  eventBus.emit(type, { mfeId } as MfeEvents[typeof type])
}

/** Shell nativo (WKWebView / Android) passa `?native=1` e esconde a sidebar web. */
export function isNativeShell(): boolean {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).has('native')
}

const ASSET_PROXY: [string, string][] = [
  ['https://picsum.photos', '/__proxy/picsum'],
  ['https://fastly.picsum.photos', '/__proxy/picsum'],
  ['https://i.picsum.photos', '/__proxy/picsum'],
  ['https://raw.githubusercontent.com', '/__proxy/ghraw'],
  ['https://rickandmortyapi.com', '/__proxy/rick'],
  ['https://pokeapi.co', '/__proxy/pokeapi'],
  ['https://jsonplaceholder.typicode.com', '/__proxy/jsonplaceholder'],
]

/** Reescreve URL pública pra proxy same-origin (WKWebView não carrega HTTPS direto). */
export function nativeAssetUrl(url: string): string {
  if (!isNativeShell()) return url
  for (const [from, to] of ASSET_PROXY) {
    if (url.startsWith(from)) {
      return `${window.location.origin}${to}${url.slice(from.length)}`
    }
  }
  return url
}

function postToNative(type: string, payload: unknown): void {
  const msg = JSON.stringify({ type, payload })
  const wk = (
    window as Window & {
      webkit?: { messageHandlers?: Record<string, { postMessage: (m: string) => void }> }
    }
  ).webkit?.messageHandlers?.mfeBus
  wk?.postMessage(msg)

  const android = (
    window as Window & { NativeShell?: { onEvent?: (m: string) => void } }
  ).NativeShell
  android?.onEvent?.(msg)
}

/**
 * Ponte JS ↔ nativo. No-op sem `?native=`.
 * Nativo chama `window.__NATIVE_EMIT_NAV__(mfeId)`.
 * Bus emite → `webkit.messageHandlers.mfeBus.postMessage`.
 */
export function attachNativeShellBridge(): void {
  if (!isNativeShell()) return
  if (typeof window === 'undefined') return
  if (window.__NATIVE_EMIT_NAV__) return

  onNavChange((mfeId) => {
    postToNative('nav', { mfeId })
  })

  window.__NATIVE_EMIT_NAV__ = (mfeId: ViewableMfeId) => {
    emitNavChange(mfeId)
  }

  postToNative('ready', {})
}


