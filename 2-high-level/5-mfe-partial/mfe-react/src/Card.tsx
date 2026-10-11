import { useEffect, useState } from 'react'
import { onPageParamChange, readPageParam, writePageParam } from '../../shared/page-url'
import { nativeAssetUrl } from '../../shared/event-bus'

const PAGE_SIZE = 12

type PokemonItem = {
  id: number
  name: string
  imageSrc: string
}

function pokemonIdFromUrl(url: string): number {
  const segments = url.split('/').filter(Boolean)
  return Number(segments[segments.length - 1])
}

export default function Card() {
  const [page, setPage] = useState(() => readPageParam())
  const [items, setItems] = useState<PokemonItem[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => onPageParamChange((nextPage) => {
    setPage(Math.max(1, nextPage))
  }), [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const offset = (page - 1) * PAGE_SIZE
        const res = await fetch(
          `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${PAGE_SIZE}`,
        )
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as {
          count: number
          results: Array<{ name: string; url: string }>
        }
        const pages = Math.max(1, Math.ceil(data.count / PAGE_SIZE))
        const mapped = data.results.map((entry) => {
          const id = pokemonIdFromUrl(entry.url)
          return {
            id,
            name: entry.name,
            imageSrc: nativeAssetUrl(
              `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
            ),
          }
        })
        if (cancelled) return
        setTotalPages(pages)
        setItems(mapped)
        if (page > pages) {
          writePageParam(pages)
          setPage(pages)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err))
          setItems([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [page])

  function goTo(nextPage: number) {
    const clamped = Math.min(Math.max(1, nextPage), totalPages)
    if (clamped === page) return
    writePageParam(clamped)
    setPage(clamped)
  }

  return (
    <div className="mfe-panel mfe-panel--pokemon">
      <div className="mfe-panel__header">
        <h2>Pokémon</h2>
        <p>Lista via <code>pokeapi.co</code></p>
      </div>

      {loading && (
        <div
          className="mfe-panel__grid"
          role="status"
          aria-live="polite"
          aria-label="Carregando lista"
        >
          {Array.from({ length: PAGE_SIZE }, (_, index) => (
            <div key={index} className="mfe-item mfe-item--skeleton" aria-hidden>
              <div className="mfe-skeleton mfe-skeleton--image mfe-skeleton--image-square" />
              <div className="mfe-item__body">
                <div className="mfe-skeleton mfe-skeleton--title mfe-skeleton--centered" />
                <div className="mfe-skeleton mfe-skeleton--meta mfe-skeleton--centered" />
              </div>
            </div>
          ))}
        </div>
      )}
      {error && (
        <div className="mfe-panel__status mfe-panel__status--error">Erro: {error}</div>
      )}
      {!loading && !error && (
        <>
          <ul className="mfe-panel__grid">
            {items.map((pokemon) => (
              <li key={pokemon.id} className="mfe-item">
                <img
                  src={pokemon.imageSrc}
                  alt={pokemon.name}
                  className="mfe-item__image mfe-item__image--sprite"
                />
                <div className="mfe-item__body">
                  <h3 className="mfe-item__title">{pokemon.name}</h3>
                  <span className="mfe-item__meta">#{String(pokemon.id).padStart(4, '0')}</span>
                </div>
              </li>
            ))}
          </ul>

          <nav className="mfe-pagination" aria-label="Paginação">
            <button
              type="button"
              className="mfe-pagination__btn"
              disabled={page <= 1}
              onClick={() => goTo(page - 1)}
            >
              Anterior
            </button>
            <span className="mfe-pagination__status">
              Página {page} de {totalPages}
            </span>
            <button
              type="button"
              className="mfe-pagination__btn"
              disabled={page >= totalPages}
              onClick={() => goTo(page + 1)}
            >
              Próxima
            </button>
          </nav>
        </>
      )}
    </div>
  )
}
