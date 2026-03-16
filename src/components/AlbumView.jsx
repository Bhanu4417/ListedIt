import { useState, useEffect } from 'react';
import { getAlbum, getCoverUrl, formatDuration } from '../api';
import { usePlayer } from '../context/PlayerContext';

export default function AlbumView({ albumId, navigate }) {
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const player = usePlayer();

  useEffect(() => {
    if (albumId) loadAlbum();
  }, [albumId]);

  const loadAlbum = async () => {
    setLoading(true);
    try {
      const res = await getAlbum(albumId);
      setAlbum(res?.data || null);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const getTracks = () => {
    if (!album?.items) return [];
    return album.items
      .filter(i => i.type === 'track')
      .map(i => i.item);
  };

  const handlePlayAll = () => {
    const tracks = getTracks();
    if (tracks.length > 0) {
      handlePlayTrack(tracks[0], tracks);
    }
  };

  const handlePlayTrack = (track, list) => {
    const trackList = list || getTracks();
    const formattedTrack = {
      id: track.id,
      title: track.title,
      artist: track.artist?.name || track.artists?.[0]?.name || album?.artist?.name || 'Unknown',
      albumTitle: album?.title || track.album?.title,
      cover: getCoverUrl(album?.cover || track.album?.cover),
      duration: track.duration,
    };
    const formattedList = trackList.map(t => ({
      id: t.id,
      title: t.title,
      artist: t.artist?.name || t.artists?.[0]?.name || album?.artist?.name || 'Unknown',
      albumTitle: album?.title || t.album?.title,
      cover: getCoverUrl(album?.cover || t.album?.cover),
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

  if (!album) {
    return (
      <div className="empty-state">
        <h3>Album not found</h3>
        <button className="back-button" onClick={() => navigate('home')}>
          Go back
        </button>
      </div>
    );
  }

  const tracks = getTracks();
  const coverUrl = getCoverUrl(album.cover, 640);
  const totalDuration = formatDuration(album.duration || tracks.reduce((sum, t) => sum + (t.duration || 0), 0));

  return (
    <div className="fade-in">
      <button className="back-button" onClick={() => navigate('home')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back
      </button>

      {/* Album Hero */}
      <div className="album-hero">
        <div className="album-hero-bg">
          {coverUrl && <img src={coverUrl} alt="" />}
        </div>
        <div className="album-hero-content">
          <div className="album-hero-cover">
            {coverUrl && <img src={coverUrl} alt={album.title} />}
          </div>
          <div className="album-hero-info">
            <div className="album-hero-type">{album.type || 'Album'}</div>
            <h1 className="album-hero-title">{album.title}</h1>
            <div
              className="album-hero-artist"
              onClick={() => {
                const artistId = album.artist?.id || album.artists?.[0]?.id;
                if (artistId) navigate('artist', artistId);
              }}
            >
              {album.artist?.name || album.artists?.[0]?.name}
            </div>
            <div className="album-hero-meta">
              <span>{album.releaseDate?.split('-')[0]}</span>
              <span>{album.numberOfTracks || tracks.length} songs</span>
              <span>{totalDuration}</span>
            </div>
            <div className="album-hero-actions">
              <button className="btn-play" onClick={handlePlayAll}>
                <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Play
              </button>
              <button className="btn-shuffle" onClick={() => {
                const shuffled = [...tracks].sort(() => Math.random() - 0.5);
                if (shuffled.length > 0) handlePlayTrack(shuffled[0], shuffled);
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
          </div>
        </div>
      </div>

      {/* Track List */}
      <div className="track-list">
        <div className="track-list-header">
          <span>#</span>
          <span></span>
          <span>Title</span>
          <span>Artist</span>
          <span>⏱</span>
        </div>
        {tracks.map((track, idx) => (
          <div
            key={track.id}
            className={`track-item ${player.currentTrack?.id === track.id ? 'playing' : ''}`}
            onClick={() => handlePlayTrack(track)}
          >
            <div className="track-item-number">{idx + 1}</div>
            <div className="track-item-cover">
              <img
                src={getCoverUrl(album.cover, 160)}
                alt=""
                loading="lazy"
                onError={e => { e.target.style.display = 'none'; }}
              />
            </div>
            <div className="track-item-info">
              <div className="track-item-title">{track.title}</div>
              <div className="track-item-artist">
                {track.artist?.name || track.artists?.[0]?.name || album.artist?.name}
              </div>
            </div>
            <div className="track-item-album">
              {track.artist?.name || track.artists?.[0]?.name || album.artist?.name}
            </div>
            <div className="track-item-duration">
              {formatDuration(track.duration)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
