import { useState } from 'react'
import { Nav } from './components/Nav'
import { Gallery } from './pages/Gallery'
import { Admin } from './pages/Admin'
import './App.css'

type Page = 'gallery' | 'admin'

function App() {
  const [page, setPage] = useState<Page>('gallery')

  return (
    <div className="app">
      <header className="header">
        <button
          type="button"
          className="header__logo"
          onClick={() => setPage('gallery')}
        >
          Rive Collection
        </button>
        <Nav current={page} onNavigate={setPage} />
      </header>

      <main className="main">
        {page === 'gallery' ? <Gallery /> : <Admin />}
      </main>
    </div>
  )
}

export default App
