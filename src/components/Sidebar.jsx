export default function Sidebar({ currentView, navigate, isOpen }) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
        <h1>ListedIt</h1>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">Apple Music Style</div>
        <button
          className={`sidebar-item ${currentView === 'home' ? 'active' : ''}`}
          onClick={() => navigate('home')}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          Home
        </button>
        <button
          className={`sidebar-item ${currentView === 'search' ? 'active' : ''}`}
          onClick={() => navigate('search')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          Search
        </button>
      </div>
    </aside>
  );
}
