import { StatusMessage } from '../../components/StatusMessage/StatusMessage'

import { usePokemonModel } from './usePokemonModel'

/** View: chama o model hook e só renderiza UI. */
export function PokemonPage() {
  const { pokemon, loading, error, onReload } = usePokemonModel()

  return (
    <section className="page">
      <header className="page__header">
        <p className="eyebrow">PokéAPI · View + Model hook</p>
        <h1>Pokémon</h1>
        <p className="page__lead">
          A view chama <code>usePokemonModel</code>. Não conhece service nem React
          Query.
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
