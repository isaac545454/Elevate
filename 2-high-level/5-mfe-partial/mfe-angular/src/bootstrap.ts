import { onPageParamChange, readPageParam, writePageParam } from '../../shared/page-url'
import './card.css'

const PAGE_SIZE = 12
const API_PAGE_SIZE = 20

type Character = {
  id: number
  name: string
  status: string
  species: string
  image: string
}

type CharacterListResponse = {
  info: { count: number; pages: number }
  results: Character[]
}

async function fetchApiPage(apiPage: number): Promise<CharacterListResponse> {
  const res = await fetch(`https://rickandmortyapi.com/api/character?page=${apiPage}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<CharacterListResponse>
}

async function listCharacters(appPage: number): Promise<{
  characters: Character[]
  totalPages: number
}> {
  const start = (appPage - 1) * PAGE_SIZE
  const firstApiPage = Math.floor(start / API_PAGE_SIZE) + 1
  const end = start + PAGE_SIZE
  const lastApiPage = Math.floor(Math.max(0, end - 1) / API_PAGE_SIZE) + 1

  if (firstApiPage === lastApiPage) {
    const data = await fetchApiPage(firstApiPage)
    const sliceStart = start % API_PAGE_SIZE
    return {
      totalPages: Math.max(1, Math.ceil(data.info.count / PAGE_SIZE)),
      characters: data.results.slice(sliceStart, sliceStart + PAGE_SIZE),
    }
  }

  const [first, last] = await Promise.all([
    fetchApiPage(firstApiPage),
    fetchApiPage(lastApiPage),
  ])
  const fromFirst = first.results.slice(start % API_PAGE_SIZE)
  const fromLast = last.results.slice(0, PAGE_SIZE - fromFirst.length)

  return {
    totalPages: Math.max(1, Math.ceil(first.info.count / PAGE_SIZE)),
    characters: [...fromFirst, ...fromLast],
  }
}

function renderSkeleton(): string {
  return Array.from({ length: PAGE_SIZE }, () => `
    <li class="mfe-item mfe-item--skeleton" aria-hidden="true">
      <div class="mfe-skeleton mfe-skeleton--image mfe-skeleton--image-square"></div>
      <div class="mfe-item__body">
        <div class="mfe-skeleton mfe-skeleton--title"></div>
        <div class="mfe-skeleton mfe-skeleton--line mfe-skeleton--line-short"></div>
      </div>
    </li>
  `).join('')
}

function renderItems(characters: Character[]): string {
  return characters
    .map(
      (character) => `
      <li class="mfe-item">
        <img src="${character.image}" alt="${character.name}" class="mfe-item__image" />
        <div class="mfe-item__body">
          <h3 class="mfe-item__title">${character.name}</h3>
          <p class="mfe-item__desc">${character.status} · ${character.species}</p>
        </div>
      </li>
    `,
    )
    .join('')
}

function renderPagination(page: number, totalPages: number): string {
  return `
    <nav class="mfe-pagination" aria-label="Paginação" data-pagination>
      <button type="button" class="mfe-pagination__btn" data-prev ${page <= 1 ? 'disabled' : ''}>
        Anterior
      </button>
      <span class="mfe-pagination__status">Página ${page} de ${totalPages}</span>
      <button type="button" class="mfe-pagination__btn" data-next ${page >= totalPages ? 'disabled' : ''}>
        Próxima
      </button>
    </nav>
  `
}

export async function mount(container: HTMLElement): Promise<() => void> {
  container.innerHTML = `
    <div class="mfe-panel mfe-panel--rick">
      <div class="mfe-panel__header">
        <h2>Rick and Morty</h2>
        <p>Personagens via <code>rickandmortyapi.com</code></p>
      </div>
      <div class="mfe-panel__status mfe-panel__status--error" data-error hidden></div>
      <ul
        class="mfe-panel__grid"
        data-grid
        role="status"
        aria-live="polite"
        aria-label="Carregando lista"
      >${renderSkeleton()}</ul>
      <div data-pagination-host></div>
    </div>
  `

  const errorEl = container.querySelector<HTMLElement>('[data-error]')!
  const grid = container.querySelector<HTMLUListElement>('[data-grid]')!
  const paginationHost = container.querySelector<HTMLElement>('[data-pagination-host]')!

  let cancelled = false
  let page = readPageParam()
  let totalPages = 1

  async function load(nextPage: number) {
    errorEl.hidden = true
    grid.hidden = false
    grid.setAttribute('role', 'status')
    grid.setAttribute('aria-label', 'Carregando lista')
    grid.innerHTML = renderSkeleton()
    paginationHost.innerHTML = ''

    try {
      const data = await listCharacters(nextPage)
      if (cancelled) return

      totalPages = data.totalPages
      page = Math.min(Math.max(1, nextPage), totalPages)
      if (page !== nextPage) writePageParam(page)

      grid.removeAttribute('role')
      grid.removeAttribute('aria-label')
      grid.innerHTML = renderItems(data.characters)
      paginationHost.innerHTML = renderPagination(page, totalPages)
      bindPagination()
    } catch (err) {
      if (cancelled) return
      const message = err instanceof Error ? err.message : String(err)
      errorEl.hidden = false
      errorEl.textContent = `Erro: ${message}`
      grid.hidden = true
      paginationHost.innerHTML = ''
    }
  }

  function goTo(nextPage: number) {
    const clamped = Math.min(Math.max(1, nextPage), totalPages)
    if (clamped === page) return
    writePageParam(clamped)
    page = clamped
    void load(clamped)
  }

  function bindPagination() {
    paginationHost.querySelector('[data-prev]')?.addEventListener('click', () => goTo(page - 1))
    paginationHost.querySelector('[data-next]')?.addEventListener('click', () => goTo(page + 1))
  }

  const unsubscribePopstate = onPageParamChange((nextPage) => {
    if (nextPage === page) return
    page = Math.max(1, nextPage)
    void load(page)
  })

  await load(page)

  return () => {
    cancelled = true
    unsubscribePopstate()
    container.innerHTML = ''
  }
}
