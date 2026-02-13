interface NavProps {
  current: 'gallery' | 'admin'
  onNavigate: (page: 'gallery' | 'admin') => void
}

export function Nav({ current, onNavigate }: NavProps) {
  return (
    <nav className="nav">
      <button
        type="button"
        className={`nav__link ${current === 'admin' ? 'nav__link--active' : ''}`}
        onClick={() => onNavigate('admin')}
      >
        Admin
      </button>
    </nav>
  )
}
