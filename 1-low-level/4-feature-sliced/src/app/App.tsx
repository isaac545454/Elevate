import { NavLink } from 'react-router-dom'

import { AppRouter } from './router'

const links = [
  { to: '/login', label: 'Login' },
  { to: '/register', label: 'Register' },
  { to: '/forgot-password', label: 'Esqueci a senha' },
] as const

export function App() {
  return (
    <div className="shell">
      <header className="shell__top">
        <div className="brand">
          <span className="brand__mark">4</span>
          <div>
            <strong>feature-sliced</strong>
            <p>app · features · entities · shared</p>
          </div>
        </div>

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
      </header>

      <main className="shell__main">
        <AppRouter />
      </main>
    </div>
  )
}
