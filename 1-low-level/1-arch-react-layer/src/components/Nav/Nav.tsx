export type AppRoute = 'home' | 'posts' | 'pokemon'

type NavProps = {
  current: AppRoute
  onNavigate: (route: AppRoute) => void
}

const links: Array<{ route: AppRoute; label: string }> = [
  { route: 'home', label: 'Home' },
  { route: 'posts', label: 'Posts' },
  { route: 'pokemon', label: 'Pokémon' },
]

export function Nav({ current, onNavigate }: NavProps) {
  return (
    <nav className="nav" aria-label="Principal">
      {links.map(({ route, label }) => (
        <button
          key={route}
          type="button"
          className={current === route ? 'nav__link nav__link--active' : 'nav__link'}
          onClick={() => onNavigate(route)}
        >
          {label}
        </button>
      ))}
    </nav>
  )
}
