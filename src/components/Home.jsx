import { useState, useEffect } from 'react';
import { searchTracks, getCoverUrl, formatDuration } from '../api';
import { usePlayer } from '../context/PlayerContext';

const FEATURED_QUERIES = ['trending hits', 'pop music', 'hip hop', 'rock classics', 'indie'];

export default function Home({ navigate }) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const player = usePlayer();

  useEffect(() => {
    loadHome();
  }, []);

  const loadHome = async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        FEATURED_QUERIES.map(async (q) => {
          try {
            const res = await searchTracks(q);
            return {
              title: q.charAt(0).toUpperCase() + q.slice(1),
              tracks: (res?.data?.items || []).slice(0, 10),
            };
          } catch {
            return { title: q, tracks: [] };
          }
        })
      );
      setSections(results.filter(s => s.tracks.length > 0));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handlePlayTrack = (track, trackList) => {
    const formattedTrack = {
      id: track.id,
      title: track.title,
      artist: track.artist?.name || track.artists?.[0]?.name || 'Unknown',
      albumTitle: track.album?.title,
      cover: getCoverUrl(track.album?.cover),
      duration: track.duration,
    };
    const formattedList = trackList.map(t => ({
      id: t.id,
      title: t.title,
      artist: t.artist?.name || t.artists?.[0]?.name || 'Unknown',
      albumTitle: t.album?.title,
      cover: getCoverUrl(t.album?.cover),
      duration: t.duration,
    }));
    player.playTrack(formattedTrack, formattedList);
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="search-container" style={{ margin: '-8px 0 32px 0' }}>
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input 
          type="text" 
          className="search-bar" 
          placeholder="Search for music, artists..."
          onFocus={() => navigate('search')}
        />
      </div>

      {sections[0] && (
        <section>
          <div className="section-header">
            <h2>New Releases</h2>
            <span className="see-all">View All</span>
          </div>
          <div className="new-releases-grid">
            {sections[0].tracks.slice(0, 3).map((track, idx) => (
              <div
                key={track.id}
                className={`new-release-card slide-up ${idx === 0 ? 'primary-card' : ''}`}
                onClick={() => navigate('album', track.album?.id)}
              >
                <img
                  src={getCoverUrl(track.album?.cover)}
                  alt={track.album?.title}
                  loading="lazy"
                  onError={e => { e.target.style.display = 'none'; }}
                />
                <div className="new-release-info">
                  <div className="new-release-badge">
                    {idx === 0 ? "EDITOR'S CHOICE" : idx === 1 ? "NEW SINGLE" : "HOT RELEASE"}
                  </div>
                  <div className="new-release-title">{track.album?.title || track.title}</div>
                  <div className="new-release-artist">{track.artist?.name || track.artists?.[0]?.name}</div>
                  <button className="new-release-btn" onClick={(e) => {
                    e.stopPropagation();
                    handlePlayTrack(track, sections[0].tracks);
                  }}>
                    <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    Listen Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {sections[1] && (
        <section>
          <div className="section-header">
            <h2>Recommended for You</h2>
          </div>
          <div className="recommended-grid">
            {sections[1].tracks.slice(0, 8).map(track => (
              <div
                key={track.id}
                className="recommended-card slide-up"
                onClick={() => navigate('album', track.album?.id)}
              >
                <div className="recommended-cover">
                  <img
                    src={getCoverUrl(track.album?.cover)}
                    alt={track.album?.title}
                    loading="lazy"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                </div>
                <div className="recommended-title">{track.album?.title || track.title}</div>
                <div className="recommended-artist">{track.artist?.name || track.artists?.[0]?.name}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
