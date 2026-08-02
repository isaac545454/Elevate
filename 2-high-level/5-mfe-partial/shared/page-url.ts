const DEFAULT_PARAM = 'page'

export function readPageParam(param = DEFAULT_PARAM): number {
  if (typeof window === 'undefined') return 1
  const raw = new URLSearchParams(window.location.search).get(param)
  const page = Number(raw)
  return Number.isInteger(page) && page > 0 ? page : 1
}

export function writePageParam(page: number, param = DEFAULT_PARAM): void {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  if (page <= 1) {
    url.searchParams.delete(param)
  } else {
    url.searchParams.set(param, String(page))
  }
  const next = `${url.pathname}${url.search}${url.hash}`
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`
  if (next === current) return
  window.history.pushState({}, '', next)
}

/** Escuta back/forward do browser e devolve a página atual do query param. */
export function onPageParamChange(
  handler: (page: number) => void,
  param = DEFAULT_PARAM,
): () => void {
  const listener = () => handler(readPageParam(param))
  window.addEventListener('popstate', listener)
  return () => window.removeEventListener('popstate', listener)
}
