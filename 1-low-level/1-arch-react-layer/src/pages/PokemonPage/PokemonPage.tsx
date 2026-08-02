import { PokemonCard } from '../../components/PokemonCard/PokemonCard'
import { StatusMessage } from '../../components/StatusMessage/StatusMessage'
import { usePokemonList } from '../../hooks/usePokemonList/usePokemonList'

export function PokemonPage() {
  const { pokemon, loading, error } = usePokemonList(12)

  return (
    <section className="page">
      <header className="page__header">
        <p className="eyebrow">PokéAPI</p>
        <h1>Pokémon</h1>
        <p className="page__lead">
          Page usa o hook <code>usePokemonList</code>, que chama{' '}
          <code>pokemonService</code>.
        </p>
      </header>

      {loading && <StatusMessage>Carregando pokémon…</StatusMessage>}
      {error && <StatusMessage variant="error">{error}</StatusMessage>}

      {!loading && !error && (
        <div className="grid grid--pokemon">
          {pokemon.map((item) => (
            <PokemonCard key={item.id} pokemon={item} />
          ))}
        </div>
      )}
    </section>
  )
}
