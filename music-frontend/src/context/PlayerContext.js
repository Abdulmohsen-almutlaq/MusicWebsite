'use client';

import { createContext, useState, useContext, useRef, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getCoverUrl } from '../utils/api';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const { sitePassword, user } = useAuth();
  const audioRef = useRef(null);

  // Playback State
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Queue State
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isShuffling, setIsShuffling] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none'); // 'none', 'all', 'one'

  // Clear player on logout
  useEffect(() => {
    if (!user) {
      setCurrentTrack(null);
      setIsPlaying(false);
      setQueue([]);
      setCurrentIndex(-1);
      setProgress(0);
      setDuration(0);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [user]);

  // --- AUDIO CONTROL HANDLERS ---

  const playTrack = (track, newQueue = null) => {
    if (newQueue) {
      setQueue(newQueue);
      const idx = newQueue.findIndex(t => t.id === track.id);
      setCurrentIndex(idx !== -1 ? idx : 0);
    } else {
      // If playing a single track not in queue, make a queue of 1 or append?
      // Expert behavior: usually replaces queue or adds to it. Let's replace for now or handle smart queueing.
      // For simplicity: If track is in current queue, just jump to it. If not, replace queue.
      const existingIdx = queue.findIndex(t => t.id === track.id);
      if (existingIdx !== -1) {
        setCurrentIndex(existingIdx);
      } else {
        setQueue([track]);
        setCurrentIndex(0);
      }
    }
    
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (!currentTrack) return;
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = useCallback(() => {
    if (queue.length === 0) return;
    
    let nextIndex = currentIndex + 1;
    
    if (isShuffling) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (nextIndex >= queue.length) {
      if (repeatMode === 'all') nextIndex = 0;
      else {
        setIsPlaying(false);
        return; // End of queue
      }
    }

    setCurrentIndex(nextIndex);
    setCurrentTrack(queue[nextIndex]);
    setIsPlaying(true);
  }, [queue, currentIndex, isShuffling, repeatMode]);

  const prevTrack = () => {
    if (queue.length === 0) return;
    
    // If more than 3 seconds in, restart track
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) prevIndex = queue.length - 1;

    setCurrentIndex(prevIndex);
    setCurrentTrack(queue[prevIndex]);
    setIsPlaying(true);
  };

  const seek = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume > 0 && isMuted) setIsMuted(false);
  };

  const toggleMute = () => {
    if (isMuted) {
      if (audioRef.current) audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      if (audioRef.current) audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  // --- EFFECTS ---

  // Handle Track End
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else {
        nextTrack();
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [nextTrack, repeatMode]);

  // Update Media Session (Lock Screen Controls)
  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album || '6rabyat',
        artwork: [
          { src: currentTrack.coverPath ? getCoverUrl(currentTrack.coverPath) : 'https://via.placeholder.com/512', sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => { setIsPlaying(true); audioRef.current?.play(); });
      navigator.mediaSession.setActionHandler('pause', () => { setIsPlaying(false); audioRef.current?.pause(); });
      navigator.mediaSession.setActionHandler('previoustrack', prevTrack);
      navigator.mediaSession.setActionHandler('nexttrack', nextTrack);
    }
  }, [currentTrack, nextTrack]);

  // Time Update Loop
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateProgress);
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', updateProgress);
    };
  }, [currentTrack]);

  // Construct Stream URL with Auth
  const streamUrl = currentTrack 
    ? `${process.env.NEXT_PUBLIC_API_URL}/tracks/stream/${currentTrack.id}?site_password=${sitePassword}`
    : undefined;

  return (
    <PlayerContext.Provider value={{ 
      currentTrack, 
      isPlaying, 
      queue,
      volume,
      isMuted,
      progress,
      duration,
      isShuffling,
      repeatMode,
      playTrack, 
      togglePlay,
      nextTrack,
      prevTrack,
      seek,
      setVolume: handleVolumeChange,
      toggleMute,
      setIsShuffling,
      setRepeatMode,
      audioRef 
    }}>
      {children}
      
      {/* Global Audio Element */}
      <audio
        ref={audioRef}
        src={streamUrl}
        autoPlay={isPlaying}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        crossOrigin="anonymous"
      />
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
