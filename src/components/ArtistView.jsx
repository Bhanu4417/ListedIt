import { useState, useEffect } from 'react';
import { getArtist, getArtistFull, getCoverUrl, getArtistPictureUrl, formatDuration } from '../api';
import { usePlayer } from '../context/PlayerContext';

export default function ArtistView({ artistId, navigate }) {
  const [artist, setArtist] = useState(null);
  const [artistData, setArtistData] = useState(null);
  const [loading, setLoading] = useState(true);
  const player = usePlayer();

  useEffect(() => {
    if (artistId) loadArtist();
  }, [artistId]);

  const loadArtist = async () => {
    setLoading(true);
    try {
      const [infoRes, fullRes] = await Promise.all([
        getArtist(artistId),
        getArtistFull(artistId),
      ]);
      setArtist(infoRes?.artist || infoRes?.cover || null);
      setArtistData(fullRes);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const getTopTracks = () => {
    if (!artistData?.tracks) return [];
    return artistData.tracks.slice(0, 10);
  };

  const getAlbums = () => {
    if (!artistData?.albums?.items) return [];
    return artistData.albums.items;
  };

  const handlePlayTrack = (track) => {
    const tracks = getTopTracks();
    const formattedTrack = {
      id: track.id,
      title: track.title,
      artist: track.artists?.[0]?.name || artist?.name || 'Unknown',
      albumTitle: track.album?.title,
      cover: getCoverUrl(track.album?.cover),
      duration: track.duration,
    };
    const formattedList = tracks.map(t => ({
      id: t.id,
      title: t.title,
      artist: t.artists?.[0]?.name || artist?.name || 'Unknown',
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

  if (!artist && !artistData) {
    return (
      <div className="empty-state">
        <h3>Artist not found</h3>
        <button className="back-button" onClick={() => navigate('home')}>Go back</button>
      </div>
    );
  }

  const artistName = artist?.name || artistData?.albums?.items?.[0]?.artist?.name || 'Unknown Artist';
  const pictureUrl = getArtistPictureUrl(artist?.picture);
  const topTracks = getTopTracks();
  const albums = getAlbums();

  return (
    <div className="fade-in">
      <button className="back-button" onClick={() => navigate('home')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back
      </button>

      {/* Artist Hero */}
      <div className="album-hero">
        <div className="album-hero-bg">
          {pictureUrl && <img src={pictureUrl} alt="" />}
        </div>
        <div className="album-hero-content">
          <div className="album-hero-cover" style={{ borderRadius: '50%' }}>
            {pictureUrl && <img src={pictureUrl} alt={artistName} />}
          </div>
          <div className="album-hero-info">
            <div className="album-hero-type">Artist</div>
            <h1 className="album-hero-title">{artistName}</h1>
            {artist?.popularity && (
              <div className="album-hero-meta">
                <span>Popularity: {artist.popularity}</span>
              </div>
            )}
            {topTracks.length > 0 && (
              <div className="album-hero-actions">
                <button className="btn-play" onClick={() => handlePlayTrack(topTracks[0])}>
                  <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Play
                </button>
                <button className="btn-shuffle" onClick={() => {
                  const shuffled = [...topTracks].sort(() => Math.random() - 0.5);
                  if (shuffled.length > 0) handlePlayTrack(shuffled[0]);
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 3 21 3 21 8"/>
                    <line x1="4" y1="20" x2="21" y2="3"/>
                    <polyline points="21 16 21 21 16 21"/>
                    <line x1="15" y1="15" x2="21" y2="21"/>
                    <line x1="4" y1="4" x2="9" y2="9"/>
                  </svg>
                  Shuffle
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Songs */}
      {topTracks.length > 0 && (
        <section>
          <div className="section-header">
            <h2>Top Songs</h2>
          </div>
          <div className="track-list">
            <div className="track-list-header">
              <span>#</span>
              <span></span>
              <span>Title</span>
              <span>Album</span>
              <span>⏱</span>
            </div>
            {topTracks.map((track, idx) => (
              <div
                key={track.id}
                className={`track-item ${player.currentTrack?.id === track.id ? 'playing' : ''}`}
                onClick={() => handlePlayTrack(track)}
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
                  <div className="track-item-artist">
                    {track.artists?.[0]?.name || artistName}
                  </div>
                </div>
                <div className="track-item-album">{track.album?.title}</div>
                <div className="track-item-duration">{formatDuration(track.duration)}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Albums */}
      {albums.length > 0 && (
        <section>
          <div className="section-header">
            <h2>Albums</h2>
          </div>
          <div className="album-grid">
            {albums.map(album => (
              <div
                key={album.id}
                className="album-card"
                onClick={() => navigate('album', album.id)}
              >
                <div className="album-card-cover">
                  <img
                    src={getCoverUrl(album.cover)}
                    alt={album.title}
                    loading="lazy"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  <div className="play-overlay">
                    <div className="play-overlay-btn">
                      <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </div>
                  </div>
                </div>
                <div className="album-card-title">{album.title}</div>
                <div className="album-card-artist">{album.releaseDate?.split('-')[0]}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
