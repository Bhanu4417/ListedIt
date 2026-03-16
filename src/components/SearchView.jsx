import { useState, useRef } from 'react';
import { searchTracks, searchArtists, searchAlbums, getCoverUrl, getArtistPictureUrl, formatDuration } from '../api';
import { usePlayer } from '../context/PlayerContext';

export default function SearchView({ navigate }) {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('tracks');
  const [tracks, setTracks] = useState([]);
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const player = usePlayer();
  const debounceRef = useRef(null);

  const handleSearch = (value) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setTracks([]);
      setArtists([]);
      setAlbums([]);
      setSearched(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setSearched(true);
      try {
        const [trackRes, artistRes, albumRes] = await Promise.all([
          searchTracks(value),
          searchArtists(value),
          searchAlbums(value),
        ]);
        setTracks(trackRes?.data?.items || []);
        setArtists(artistRes?.data?.artists?.items || []);
        setAlbums(albumRes?.data?.items || albumRes?.data?.albums?.items || []);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }, 400);
  };

  const handlePlayTrack = (track) => {
    const formattedTrack = {
      id: track.id,
      title: track.title,
      artist: track.artist?.name || track.artists?.[0]?.name || 'Unknown',
      albumTitle: track.album?.title,
      cover: getCoverUrl(track.album?.cover),
      duration: track.duration,
    };
    const formattedList = tracks.map(t => ({
      id: t.id,
      title: t.title,
      artist: t.artist?.name || t.artists?.[0]?.name || 'Unknown',
      albumTitle: t.album?.title,
      cover: getCoverUrl(t.album?.cover),
      duration: t.duration,
    }));
    player.playTrack(formattedTrack, formattedList);
  };

  return (
    <div className="fade-in">
      {/* Search Bar */}
      <div className="search-container">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          className="search-bar"
          type="text"
          placeholder="Search songs, artists, albums..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          autoFocus
          id="search-input"
        />
      </div>

      {/* Tabs */}
      {searched && (
        <div className="tabs">
          <button className={`tab ${tab === 'tracks' ? 'active' : ''}`} onClick={() => setTab('tracks')}>
            Songs {tracks.length > 0 && `(${tracks.length})`}
          </button>
          <button className={`tab ${tab === 'artists' ? 'active' : ''}`} onClick={() => setTab('artists')}>
            Artists {artists.length > 0 && `(${artists.length})`}
          </button>
          <button className={`tab ${tab === 'albums' ? 'active' : ''}`} onClick={() => setTab('albums')}>
            Albums {albums.length > 0 && `(${albums.length})`}
          </button>
        </div>
      )}

      {loading && (
        <div className="loading-spinner">
          <div className="spinner" />
        </div>
      )}

      {/* Track Results */}
      {!loading && tab === 'tracks' && tracks.length > 0 && (
        <div className="track-list slide-up">
          <div className="track-list-header">
            <span>#</span>
            <span></span>
            <span>Title</span>
            <span>Album</span>
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
      )}

      {/* Artist Results */}
      {!loading && tab === 'artists' && artists.length > 0 && (
        <div className="artist-grid slide-up">
          {artists.map(artist => (
            <div
              key={artist.id}
              className="artist-card"
              onClick={() => navigate('artist', artist.id)}
            >
              <div className="artist-card-avatar">
                <img
                  src={getArtistPictureUrl(artist.picture)}
                  alt={artist.name}
                  loading="lazy"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              </div>
              <div className="artist-card-name">{artist.name}</div>
            </div>
          ))}
        </div>
      )}

      {/* Album Results */}
      {!loading && tab === 'albums' && albums.length > 0 && (
        <div className="album-grid slide-up">
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
              </div>
              <div className="album-card-title">{album.title}</div>
              <div className="album-card-artist">
                {album.artist?.name || album.artists?.[0]?.name}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && searched && tracks.length === 0 && artists.length === 0 && albums.length === 0 && (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <h3>No results found</h3>
          <p>Try searching for something else</p>
        </div>
      )}

      {!searched && (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <h3>Search for music</h3>
          <p>Find your favorite songs, artists, and albums</p>
        </div>
      )}
    </div>
  );
}
