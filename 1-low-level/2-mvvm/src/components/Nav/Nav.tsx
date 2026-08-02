import { NavLink } from 'react-router-dom'

const links = [
  { to: '/posts', label: 'Posts' },
  { to: '/pokemon', label: 'Pokémon' },
] as const

export function Nav() {
  return (
    <nav className="nav" aria-label="Principal">
      {links.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            isActive ? 'nav__link nav__link--active' : 'nav__link'
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
