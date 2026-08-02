import { Nav } from './components/Nav/Nav'
import { AppRouter } from './router'

function App() {
  return (
    <div className="shell">
      <header className="shell__top">
        <div className="brand">
          <span className="brand__mark">5</span>
          <div>
            <strong>react-arch-based</strong>
            <p>api · service · query · model · view</p>
          </div>
        </div>
        <Nav />
      </header>

      <main className="shell__main">
        <AppRouter />
      </main>
    </div>
  )
}

export default App
