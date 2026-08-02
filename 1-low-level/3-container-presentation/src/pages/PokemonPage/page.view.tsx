import { StatusMessage } from '../../components/StatusMessage/StatusMessage'

import type { PokemonPageViewProps } from './page.types'

/** Presentation: só recebe props e renderiza. */
export function PokemonPageView({
  pokemon,
  loading,
  error,
  onReload,
}: PokemonPageViewProps) {
  return (
    <section className="page">
      <header className="page__header">
        <p className="eyebrow">PokéAPI · Presentation</p>
        <h1>Pokémon</h1>
        <p className="page__lead">
          A presentation só recebe props. Não conhece services nem React Query.
        </p>
      </header>

      <div className="page__toolbar">
        <button type="button" className="btn btn--ghost" onClick={onReload}>
          Recarregar
        </button>
      </div>

      {loading && <StatusMessage>Carregando pokémon…</StatusMessage>}
      {error && <StatusMessage variant="error">{error}</StatusMessage>}

      {!loading && !error && (
        <div className="grid grid--pokemon">
          {pokemon.map((item) => (
            <article key={item.id} className="card card--pokemon">
              <img
                className="card__sprite"
                src={item.imageSrc}
                alt={item.name}
                width={96}
                height={96}
              />
              <span className="card__meta">#{item.id}</span>
              <h3 className="card__title">{item.name}</h3>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
