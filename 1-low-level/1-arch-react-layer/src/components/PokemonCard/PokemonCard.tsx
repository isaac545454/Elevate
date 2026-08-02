import type { Pokemon } from '../../types/pokemon'

type PokemonCardProps = {
  pokemon: Pokemon
}

export function PokemonCard({ pokemon }: PokemonCardProps) {
  return (
    <article className="card card--pokemon">
      <img
        className="card__sprite"
        src={pokemon.imageSrc}
        alt={pokemon.name}
        width={96}
        height={96}
      />
      <span className="card__meta">#{pokemon.id}</span>
      <h3 className="card__title">{pokemon.name}</h3>
    </article>
  )
}
