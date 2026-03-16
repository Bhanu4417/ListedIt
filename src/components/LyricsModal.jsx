import { useState, useEffect } from 'react';
import { getLyrics } from '../api';

export default function LyricsModal({ trackId, trackTitle, trackArtist, onClose }) {
  const [lyrics, setLyrics] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLyrics();
  }, [trackId]);

  const loadLyrics = async () => {
    setLoading(true);
    try {
      const res = await getLyrics(trackId);
      setLyrics(res?.lyrics?.lyrics || 'Lyrics not available for this track.');
    } catch {
      setLyrics('Lyrics not available for this track.');
    }
    setLoading(false);
  };

  return (
    <div className="lyrics-overlay" onClick={onClose}>
      <div className="lyrics-modal" onClick={(e) => e.stopPropagation()}>
        <button className="lyrics-modal-close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <h3>{trackTitle}</h3>
        <div className="lyrics-artist">{trackArtist}</div>
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner" />
          </div>
        ) : (
          <div className="lyrics-text">{lyrics}</div>
        )}
      </div>
    </div>
  );
}
