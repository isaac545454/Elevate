import { useEffect, useRef, useState } from 'react'
import {
  emitNavChange,
  isNativeShell,
  onNavChange,
  type ViewableMfeId,
} from '../../shared/event-bus'
import {
  attachMfeShadow,
  createShadowMountPoint,
  getFederationCssUrls,
  injectStylesIntoShadow,
} from '../../shared/shadow-mount'

const MFES: { id: ViewableMfeId; label: string; remoteName: string }[] = [
  { id: 'jsonplaceholder', label: 'JSONPlaceholder', remoteName: 'mfe_vue' },
  { id: 'pokemon', label: 'Pokémon', remoteName: 'mfe_react' },
  { id: 'rick', label: 'Rick and Morty', remoteName: 'mfe_angular' },
]

type MountFn = (container: HTMLElement) => void | (() => void) | Promise<void | (() => void)>
type RemoteModule = { mount?: MountFn; default?: { mount?: MountFn } }

function resolveMount(mod: RemoteModule): MountFn {
  const mount = mod.mount ?? mod.default?.mount
  if (typeof mount !== 'function') {
    throw new Error('Remote não exporta mount')
  }
  return mount
}

const MFE_LOADERS: Record<ViewableMfeId, () => Promise<RemoteModule>> = {
  jsonplaceholder: () => import('mfe_vue/Card'),
  pokemon: () => import('mfe_react/Card'),
  rick: () => import('mfe_angular/Card'),
}

type MfeSlotProps = {
  remoteName: string
  loader: () => Promise<RemoteModule>
  label: string
  visible: boolean
  shouldLoad: boolean
}

function MfeSlot({ remoteName, loader, label, visible, shouldLoad }: MfeSlotProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const mountedRef = useRef(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!shouldLoad || mountedRef.current) return

    let cleanup: (() => void) | undefined
    let cancelled = false

    setStatus('loading')
    setError(null)

    loader()
      .then(async (mod) => {
        if (cancelled || !hostRef.current) {
          throw new Error('Container não disponível')
        }

        const shadow = attachMfeShadow(hostRef.current)
        injectStylesIntoShadow(shadow, getFederationCssUrls(remoteName))
        const mountPoint = createShadowMountPoint(shadow)

        const result = resolveMount(mod)(mountPoint)
        if (result instanceof Promise) {
          cleanup = (await result) ?? undefined
        } else {
          cleanup = result ?? undefined
        }

        injectStylesIntoShadow(shadow, getFederationCssUrls(remoteName))

        if (cancelled) {
          cleanup?.()
          return
        }

        mountedRef.current = true
        setStatus('ready')
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message = err instanceof Error ? err.message : String(err)
        setError(message)
        setStatus('error')
        console.error(`[MfeSlot] Falha ao carregar ${label}:`, err)
      })

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [shouldLoad, loader, label, remoteName])

  const showLoading = visible && status === 'loading'
  const showError = visible && status === 'error'

  return (
    <div className={`mfe-slot${visible ? '' : ' mfe-slot--hidden'}`}>
      {showLoading && (
        <div className="remote-loading">Carregando {label}…</div>
      )}
      {showError && (
        <div className="remote-error">
          <strong>Erro ao carregar {label}</strong>
          <p>{error}</p>
          <p className="remote-error__hint">
            Verifique se todos os remotes estão nas portas corretas (5001–5003) e reinicie com <code>npm run dev</code>
          </p>
        </div>
      )}
      <div
        ref={hostRef}
        className="remote-mount"
        style={{ display: status === 'ready' ? 'block' : 'none' }}
      />
    </div>
  )
}

export default function App() {
  const nativeShell = isNativeShell()
  const [activeMfe, setActiveMfe] = useState<ViewableMfeId>('jsonplaceholder')
  const [visited, setVisited] = useState<Set<ViewableMfeId>>(
    () => new Set(['jsonplaceholder']),
  )

  useEffect(() => onNavChange(setActiveMfe), [])

  useEffect(() => {
    setVisited((prev) => (prev.has(activeMfe) ? prev : new Set(prev).add(activeMfe)))
  }, [activeMfe])

  const activeLabel = MFES.find((mfe) => mfe.id === activeMfe)?.label ?? activeMfe

  return (
    <div className={`shell${nativeShell ? ' shell--native' : ''}`}>
      {!nativeShell && (
        <aside className="shell__sidebar">
          <nav className="sidebar">
            <ul className="sidebar__nav">
              {MFES.map((mfe) => (
                <li key={mfe.id}>
                  <button
                    type="button"
                    className={`sidebar__btn sidebar__btn--${mfe.id}${activeMfe === mfe.id ? ' sidebar__btn--active' : ''}`}
                    onClick={() => emitNavChange(mfe.id)}
                  >
                    <span className="sidebar__btn-dot" />
                    {mfe.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      )}

      <main className="shell__main">
        <header className="shell__header">
          <h1>{activeLabel}</h1>
          <p>
            {nativeShell
              ? 'Host nativo — navegação via event bus'
              : 'Container — cada MFE busca e exibe dados de uma API pública'}
          </p>
        </header>

        <div className="shell__content">
          {MFES.map((mfe) => (
            <MfeSlot
              key={mfe.id}
              remoteName={mfe.remoteName}
              loader={MFE_LOADERS[mfe.id]}
              label={mfe.label}
              visible={activeMfe === mfe.id}
              shouldLoad={visited.has(mfe.id)}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
