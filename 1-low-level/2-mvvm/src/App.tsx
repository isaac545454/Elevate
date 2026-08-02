import { Nav } from './components/Nav/Nav'
import { AppRouter } from './router'

function App() {
  return (
    <div className="shell">
      <header className="shell__top">
        <div className="brand">
          <span className="brand__mark">2</span>
          <div>
            <strong>mvvm</strong>
            <p>page · model · view · services</p>
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
