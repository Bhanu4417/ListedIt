import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { getTrackStream, decodeManifest, getCoverUrl } from '../api';

const PlayerContext = createContext(null);

export function usePlayer() {
  return useContext(PlayerContext);
}

export function PlayerProvider({ children }) {
  const audioRef = useRef(new Audio());
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      if (queueIndex < queue.length - 1) {
        playFromQueue(queueIndex + 1);
      } else {
        setIsPlaying(false);
      }
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, [queueIndex, queue.length]);

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  const resolveStreamUrl = async (trackId) => {
    try {
      const data = await getTrackStream(trackId, 'HIGH');
      if (data?.data?.manifest) {
        const manifest = decodeManifest(data.data.manifest);
        if (manifest?.urls?.[0]) return manifest.urls[0];
      }
    } catch (e) {
      console.error('Stream resolve failed:', e);
    }
    return null;
  };

  const playTrack = useCallback(async (track, trackList = null) => {
    setLoading(true);
    try {
      const url = await resolveStreamUrl(track.id);
      if (url) {
        audioRef.current.pause();
        audioRef.current.src = url;
        audioRef.current.load();
        setCurrentTrack(track);
        if (trackList) {
          setQueue(trackList);
          const idx = trackList.findIndex(t => t.id === track.id);
          setQueueIndex(idx >= 0 ? idx : 0);
        }
        await audioRef.current.play();
      }
    } catch (e) {
      console.error('Playback error:', e);
    }
    setLoading(false);
  }, []);

  const playFromQueue = useCallback(async (index) => {
    if (index >= 0 && index < queue.length) {
      setQueueIndex(index);
      const track = queue[index];
      setLoading(true);
      try {
        const url = await resolveStreamUrl(track.id);
        if (url) {
          audioRef.current.pause();
          audioRef.current.src = url;
          audioRef.current.load();
          setCurrentTrack(track);
          await audioRef.current.play();
        }
      } catch (e) {
        console.error('Playback error:', e);
      }
      setLoading(false);
    }
  }, [queue]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  }, [isPlaying]);

  const nextTrack = useCallback(() => {
    if (queueIndex < queue.length - 1) {
      playFromQueue(queueIndex + 1);
    }
  }, [queueIndex, queue.length, playFromQueue]);

  const prevTrack = useCallback(() => {
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
    } else if (queueIndex > 0) {
      playFromQueue(queueIndex - 1);
    }
  }, [queueIndex, playFromQueue]);

  const seek = useCallback((time) => {
    audioRef.current.currentTime = time;
  }, []);

  const value = {
    currentTrack, isPlaying, currentTime, duration,
    volume, setVolume, loading, queue, queueIndex,
    playTrack, togglePlay, nextTrack, prevTrack, seek
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}
