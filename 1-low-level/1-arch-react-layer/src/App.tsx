import { useState } from 'react'

import { Nav, type AppRoute } from './components/Nav/Nav'
import { HomePage } from './pages/HomePage/HomePage'
import { PokemonPage } from './pages/PokemonPage/PokemonPage'
import { PostsPage } from './pages/PostsPage/PostsPage'

function App() {
  const [route, setRoute] = useState<AppRoute>('home')

  return (
    <div className="shell">
      <header className="shell__top">
        <div className="brand">
          <span className="brand__mark">1</span>
          <div>
            <strong>arch-react-layer</strong>
            <p>pages · components · hooks · services</p>
          </div>
        </div>
        <Nav current={route} onNavigate={setRoute} />
      </header>

      <main className="shell__main">
        {route === 'home' && <HomePage onNavigate={setRoute} />}
        {route === 'posts' && <PostsPage />}
        {route === 'pokemon' && <PokemonPage />}
      </main>
    </div>
  )
}

export default App
