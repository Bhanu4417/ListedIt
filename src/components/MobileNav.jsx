export default function MobileNav({ currentView, navigate, onMenuClick }) {
  return (
    <nav className="mobile-nav" style={{ justifyContent: 'center', gap: '48px' }}>
      <button
        className={`mobile-nav-item ${currentView === 'home' ? 'active' : ''}`}
        onClick={() => navigate('home')}
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
        Home
      </button>

      <button
        className={`mobile-nav-item ${currentView === 'search' ? 'active' : ''}`}
        onClick={() => navigate('search')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        Search
      </button>
    </nav>
  );
}
