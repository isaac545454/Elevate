import { Nav } from './components/Nav/Nav'
import { AppRouter } from './router'

function App() {
  return (
    <div className="shell">
      <header className="shell__top">
        <div className="brand">
          <span className="brand__mark">3</span>
          <div>
            <strong>container-presentation</strong>
            <p>container · presentation · services</p>
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
