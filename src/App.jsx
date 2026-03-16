import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import SearchView from './components/SearchView';
import AlbumView from './components/AlbumView';
import ArtistView from './components/ArtistView';
import NowPlaying from './components/NowPlaying';
import MobileNav from './components/MobileNav';

export default function App() {
  const [view, setView] = useState('home');
  const [viewData, setViewData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = (newView, data = null) => {
    setView(newView);
    setViewData(data);
    setSidebarOpen(false);
  };

  const renderView = () => {
    switch (view) {
      case 'search':
        return <SearchView navigate={navigate} />;
      case 'album':
        return <AlbumView albumId={viewData} navigate={navigate} />;
      case 'artist':
        return <ArtistView artistId={viewData} navigate={navigate} />;
      case 'home':
      default:
        return <Home navigate={navigate} />;
    }
  };

  return (
    <>
      <div className="app-layout">
        <div
          className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />
        <Sidebar
          currentView={view}
          navigate={navigate}
          isOpen={sidebarOpen}
        />
        <main className="main-content">
          {renderView()}
        </main>
      </div>
      <NowPlaying navigate={navigate} />
      <MobileNav
        currentView={view}
        navigate={navigate}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />
    </>
  );
}
