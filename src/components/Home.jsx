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
      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero-bg" />
        <div className="home-hero-content">
          <h2>Listen Now</h2>
          <p>Discover millions of songs. Stream in high fidelity. Your music, your way.</p>
        </div>
      </section>

      {/* Featured Album Cards from first section */}
      {sections[0] && (
        <section>
          <div className="section-header">
            <h2>Featured</h2>
          </div>
          <div className="album-grid">
            {sections[0].tracks.slice(0, 6).map(track => (
              <div
                key={track.id}
                className="album-card slide-up"
                onClick={() => navigate('album', track.album?.id)}
              >
                <div className="album-card-cover">
                  <img
                    src={getCoverUrl(track.album?.cover)}
                    alt={track.album?.title}
                    loading="lazy"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  <div className="play-overlay">
                    <button className="play-overlay-btn" onClick={(e) => {
                      e.stopPropagation();
                      handlePlayTrack(track, sections[0].tracks);
                    }}>
                      <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </button>
                  </div>
                </div>
                <div className="album-card-title">{track.album?.title || track.title}</div>
                <div className="album-card-artist">{track.artist?.name || track.artists?.[0]?.name}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Track Lists */}
      {sections.map((section, i) => (
        <section key={i} style={{ marginBottom: 48 }}>
          <div className="section-header">
            <h2>{section.title}</h2>
          </div>
          <div className="track-list">
            <div className="track-list-header">
              <span>#</span>
              <span></span>
              <span>Title</span>
              <span>Album</span>
              <span>⏱</span>
            </div>
            {section.tracks.slice(0, 5).map((track, idx) => (
              <div
                key={track.id}
                className={`track-item ${player.currentTrack?.id === track.id ? 'playing' : ''}`}
                onClick={() => handlePlayTrack(track, section.tracks)}
              >
                <div className="track-item-number">{idx + 1}</div>
                <div className="track-item-cover">
                  <img
                    src={getCoverUrl(track.album?.cover, 160)}
                    alt=""
                    loading="lazy"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                </div>
                <div className="track-item-info">
                  <div className="track-item-title">{track.title}</div>
                  <div
                    className="track-item-artist"
                    onClick={(e) => {
                      e.stopPropagation();
                      const artistId = track.artist?.id || track.artists?.[0]?.id;
                      if (artistId) navigate('artist', artistId);
                    }}
                  >
                    {track.artist?.name || track.artists?.[0]?.name}
                  </div>
                </div>
                <div
                  className="track-item-album"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (track.album?.id) navigate('album', track.album.id);
                  }}
                >
                  {track.album?.title}
                </div>
                <div className="track-item-duration">
                  {formatDuration(track.duration)}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
