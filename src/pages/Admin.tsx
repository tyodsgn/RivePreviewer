import { useState, useEffect, useCallback } from 'react'
import { getAllRives, addRive, deleteRive, type RiveRecord } from '../db'
import { signIn, signUp, signOut, getSession, onAuthChange } from '../auth'
import { DropZone } from '../DropZone'

export function Admin() {
  const [auth, setAuth] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [authMessage, setAuthMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [rives, setRives] = useState<RiveRecord[]>([])
  const [loading, setLoading] = useState(true)

  // Check existing session on mount + listen for auth changes
  useEffect(() => {
    getSession().then((session) => {
      setAuth(!!session)
      setInitializing(false)
    })

    const unsubscribe = onAuthChange((_event, session) => {
      setAuth(!!session)
    })

    return unsubscribe
  }, [])

  const loadRives = useCallback(() => {
    setLoading(true)
    getAllRives()
      .then(setRives)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (auth) loadRives()
  }, [auth, loadRives])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setAuthMessage(null)
    setSubmitting(true)

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password)
        if (error) setAuthError(error)
      } else {
        const { error } = await signUp(email, password)
        if (error) {
          setAuthError(error)
        } else {
          setAuthMessage('Check your email for a confirmation link, then log in.')
          setMode('login')
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    setEmail('')
    setPassword('')
  }

  const handleFileLoaded = useCallback(
    (buffer: ArrayBuffer, name: string) => {
      addRive(name, buffer).then(() => loadRives())
    },
    [loadRives],
  )

  const handleDelete = useCallback(
    (id: string) => {
      deleteRive(id).then(() => loadRives())
    },
    [loadRives],
  )

  if (initializing) {
    return (
      <div className="admin admin--login-view">
        <p className="admin__loading">Loading...</p>
      </div>
    )
  }

  if (!auth) {
    return (
      <div className="admin admin--login-view">
        <div className="admin__login">
          <h2>{mode === 'login' ? 'Admin Login' : 'Create Account'}</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="admin__input"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="admin__input"
              required
              minLength={6}
            />
            {authError && <p className="admin__error">{authError}</p>}
            {authMessage && <p className="admin__message">{authMessage}</p>}
            <button
              type="submit"
              className="admin__btn admin__btn--primary"
              disabled={submitting}
            >
              {submitting ? '...' : mode === 'login' ? 'Login' : 'Sign Up'}
            </button>
          </form>
          <button
            type="button"
            className="admin__toggle"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login')
              setAuthError(null)
              setAuthMessage(null)
            }}
          >
            {mode === 'login'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Log in'}
          </button>
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
