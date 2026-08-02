export const FEDERATION_EXPOSE = './Card' as const

export function getFederationCssUrls(
  remoteName: string,
  exposeName: string = FEDERATION_EXPOSE,
): string[] {
  const key = `css__${remoteName}__${exposeName}`
  const urls = (window as unknown as Record<string, string[] | undefined>)[key]
  return urls ? [...urls] : []
}

export function attachMfeShadow(host: HTMLElement): ShadowRoot {
  return host.shadowRoot ?? host.attachShadow({ mode: 'open' })
}

const HOST_BASE_STYLE = `
:host {
  display: block;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1e293b;
  line-height: 1.5;
}
`

export function injectStylesIntoShadow(shadow: ShadowRoot, hrefs: string[]): void {
  if (!shadow.querySelector('[data-mfe-host-base]')) {
    const base = document.createElement('style')
    base.setAttribute('data-mfe-host-base', '')
    base.textContent = HOST_BASE_STYLE
    shadow.appendChild(base)
  }

  for (const href of hrefs) {
    if (shadow.querySelector(`link[data-mfe-css="${href}"]`)) continue

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.setAttribute('data-mfe-css', href)
    shadow.appendChild(link)
  }
}

export function createShadowMountPoint(shadow: ShadowRoot): HTMLElement {
  const existing = shadow.querySelector<HTMLElement>('[data-mfe-mount]')
  if (existing) return existing

  const mount = document.createElement('div')
  mount.setAttribute('data-mfe-mount', '')
  shadow.appendChild(mount)
  return mount
}
