import type { AppRoute } from '../../components/Nav/Nav'

type HomePageProps = {
  onNavigate: (route: AppRoute) => void
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <section className="page">
      <header className="page__header">
        <p className="eyebrow">Arquitetura em camadas</p>
        <h1>pages → hooks → services</h1>
        <p className="page__lead">
          Exemplo mínimo: cada pasta tem uma responsabilidade. As pages
          orquestram, os hooks carregam estado, os services falam com APIs
          públicas e os components só renderizam UI.
        </p>
      </header>

      <div className="layer-map" aria-label="Mapa das camadas">
        <div className="layer-map__item">
          <strong>pages/</strong>
          <span>composem a tela</span>
        </div>
        <div className="layer-map__item">
          <strong>hooks/</strong>
          <span>estado + efeito</span>
        </div>
        <div className="layer-map__item">
          <strong>services/</strong>
          <span>fetch das APIs</span>
        </div>
        <div className="layer-map__item">
          <strong>components/</strong>
          <span>UI reutilizável</span>
        </div>
      </div>

      <div className="home-actions">
        <button type="button" className="btn" onClick={() => onNavigate('posts')}>
          Ver posts (JSONPlaceholder)
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => onNavigate('pokemon')}
        >
          Ver pokémon (PokéAPI)
        </button>
      </div>
    </section>
  )
}
