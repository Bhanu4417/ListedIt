import { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration, getLyrics } from '../api';
import LyricsModal from './LyricsModal';

export default function NowPlaying({ navigate }) {
  const player = usePlayer();
  const [showLyrics, setShowLyrics] = useState(false);

  if (!player.currentTrack) return null;

  const { currentTrack, isPlaying, currentTime, duration, volume, setVolume } = player;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    player.seek(pct * duration);
  };

  return (
    <>
      <div className={`now-playing ${!currentTrack ? 'hidden' : ''}`}>
        {/* Track Info */}
        <div className="now-playing-track">
          <div className="now-playing-cover">
            {currentTrack.cover && (
              <img src={currentTrack.cover} alt={currentTrack.title} />
            )}
          </div>
          <div className="now-playing-info">
            <div className="now-playing-title">{currentTrack.title}</div>
            <div className="now-playing-artist">{currentTrack.artist}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="now-playing-controls">
          <div className="now-playing-buttons">
            <button className="ctrl-btn" onClick={player.prevTrack} title="Previous">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>

            <button
              className="ctrl-btn play-pause"
              onClick={player.togglePlay}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {player.loading ? (
                <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
              ) : isPlaying ? (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            <button className="ctrl-btn" onClick={player.nextTrack} title="Next">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="progress-container">
            <span className="progress-time">{formatDuration(currentTime)}</span>
            <div className="progress-bar" onClick={handleProgressClick}>
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="progress-time">{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Extra Controls */}
        <div className="now-playing-extra">
          <button
            className="ctrl-btn"
            onClick={() => setShowLyrics(true)}
            title="Lyrics"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M4 10h12M4 14h16M4 18h8"/>
            </svg>
          </button>
          <div className="volume-container">
            <button className="ctrl-btn" onClick={() => setVolume(volume > 0 ? 0 : 0.8)}>
              {volume === 0 ? (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              )}
            </button>
            <input
              type="range"
              className="volume-slider"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>

      {showLyrics && (
        <LyricsModal
          trackId={currentTrack.id}
          trackTitle={currentTrack.title}
          trackArtist={currentTrack.artist}
          onClose={() => setShowLyrics(false)}
        />
      )}
    </>
  );
}
