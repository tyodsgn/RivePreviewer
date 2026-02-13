import { useState, useEffect, useCallback } from 'react'
import { getAllRives, addRive, deleteRive, type RiveRecord } from '../db'
import { validateLogin, setAuthenticated, isAuthenticated } from '../auth'
import { DropZone } from '../DropZone'

export function Admin() {
  const [auth, setAuth] = useState(isAuthenticated())
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [rives, setRives] = useState<RiveRecord[]>([])
  const [loading, setLoading] = useState(true)

  const loadRives = useCallback(() => {
    setLoading(true)
    getAllRives()
      .then(setRives)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (auth) loadRives()
  }, [auth, loadRives])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    if (validateLogin(username, password)) {
      setAuthenticated(true)
      setAuth(true)
    } else {
      setAuthError('Invalid credentials')
    }
  }

  const handleLogout = () => {
    setAuthenticated(false)
    setAuth(false)
    setUsername('')
    setPassword('')
  }

  const handleFileLoaded = useCallback((buffer: ArrayBuffer, name: string) => {
    addRive(name, buffer).then(() => loadRives())
  }, [loadRives])

  const handleDelete = useCallback(
    (id: string) => {
      deleteRive(id).then(() => loadRives())
    },
    [loadRives],
  )

  if (!auth) {
    return (
      <div className="admin admin--login-view">
        <div className="admin__login">
          <h2>Admin Login</h2>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="admin__input"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="admin__input"
            />
            {authError && <p className="admin__error">{authError}</p>}
            <button type="submit" className="admin__btn admin__btn--primary">
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="admin">
      <div className="admin__header">
        <h2>Manage Rive Files</h2>
        <button type="button" className="admin__logout" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <section className="admin__upload">
        <h3>Upload</h3>
        <DropZone onFileLoaded={handleFileLoaded} />
      </section>

      <section className="admin__list">
        <h3>Your Rive Files</h3>
        {loading ? (
          <p className="admin__loading">Loading...</p>
        ) : rives.length === 0 ? (
          <p className="admin__empty">No files uploaded yet.</p>
        ) : (
          <ul className="admin__grid">
            {rives.map((r) => (
              <li key={r.id} className="admin__item">
                <span className="admin__item-name">{r.name}</span>
                <button
                  type="button"
                  className="admin__delete"
                  onClick={() => handleDelete(r.id)}
                  title="Delete"
                  aria-label={`Delete ${r.name}`}
                >
                  <DeleteIcon />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function DeleteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  )
}
