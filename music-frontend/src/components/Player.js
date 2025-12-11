'use client';

import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat, Mic2, ListMusic } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { getCoverUrl } from '../utils/api';

const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%231B3C53'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='14' fill='%23456882' text-anchor='middle' dy='.3em'%3ENo Cover%3C/text%3E%3C/svg%3E";

export default function Player() {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    nextTrack, 
    prevTrack,
    progress,
    duration,
    seek,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    isShuffling,
    setIsShuffling,
    repeatMode,
    setRepeatMode
  } = usePlayer();

  if (!currentTrack) return null;

  const formatTime = (time) => {
    if (!time) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    const width = e.currentTarget.clientWidth;
    const clickX = e.nativeEvent.offsetX;
    const newTime = (clickX / width) * duration;
    seek(newTime);
  };

  return (
    <div className="relative h-20 md:h-24 bg-brand-dark/95 backdrop-blur-xl border-t border-white/5 px-4 grid grid-cols-3 items-center z-50 select-none shadow-2xl">
      {/* Mobile Progress Bar */}
      <div className="md:hidden absolute top-0 left-0 w-full h-1 bg-white/10 cursor-pointer group col-span-3" onClick={handleSeek}>
        <div 
          className="h-full bg-brand-beige relative transition-all duration-100 ease-linear" 
          style={{ width: `${(progress / duration) * 100}%` }}
        >
           <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-brand-beige rounded-full shadow-lg shadow-black/50 scale-0 group-hover:scale-100 transition-transform"></div>
        </div>
      </div>

      {/* Track Info - Left Column */}
      <div className="flex items-center gap-3 min-w-0 justify-self-start w-full pr-2">
        <div className="relative flex-shrink-0 group">
          <img 
            src={currentTrack.coverPath ? getCoverUrl(currentTrack.coverPath) : PLACEHOLDER_IMAGE} 
            alt="Cover" 
            className="w-10 h-10 md:w-14 md:h-14 rounded-lg object-cover shadow-lg border border-white/10 bg-brand-medium group-hover:scale-105 transition-transform duration-300"
            onError={(e) => e.target.src = PLACEHOLDER_IMAGE}
          />
        </div>
        <div className="overflow-hidden flex-1 min-w-0 flex flex-col justify-center">
          <h4 className="text-brand-beige font-bold text-sm md:text-base truncate leading-tight tracking-wide">{currentTrack.title}</h4>
          <p className="text-brand-light/70 text-xs md:text-sm truncate hover:text-brand-beige transition-colors font-medium">{currentTrack.artist}</p>
        </div>
      </div>

      {/* Controls - Center Column */}
      <div className="flex flex-col items-center justify-center w-full gap-1 md:gap-2">
        <div className="flex items-center justify-center gap-3 md:gap-6 w-full">
          <button 
            onClick={() => setIsShuffling(!isShuffling)}
            className={`hidden md:block text-brand-light hover:text-brand-beige transition-colors ${isShuffling ? 'text-green-500 hover:text-green-400' : ''}`}
            title="Shuffle"
          >
            <Shuffle size={18} />
          </button>
          
          <button onClick={prevTrack} className="text-brand-light hover:text-brand-beige transition-colors p-1.5 md:p-2 hover:bg-white/5 rounded-full">
            <SkipBack size={20} className="md:w-[22px] md:h-[22px]" fill="currentColor" />
          </button>
          
          <button 
            onClick={togglePlay}
            className="w-10 h-10 md:w-10 md:h-10 bg-brand-beige text-brand-dark rounded-full flex items-center justify-center hover:scale-105 hover:bg-white transition-all active:scale-95 shadow-lg shadow-brand-beige/20 mx-1"
          >
            {isPlaying ? <Pause fill="currentColor" size={20} className="md:w-5 md:h-5" /> : <Play fill="currentColor" className="ml-1 md:w-5 md:h-5" size={20} />}
          </button>
          
          <button onClick={nextTrack} className="text-brand-light hover:text-brand-beige transition-colors p-1.5 md:p-2 hover:bg-white/5 rounded-full">
            <SkipForward size={20} className="md:w-[22px] md:h-[22px]" fill="currentColor" />
          </button>
          
          <button 
            onClick={() => {
              const modes = ['none', 'all', 'one'];
              const nextMode = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
              setRepeatMode(nextMode);
            }}
            className={`hidden md:block text-brand-light hover:text-brand-beige transition-colors ${repeatMode !== 'none' ? 'text-green-500 hover:text-green-400' : ''} relative`}
            title="Repeat"
          >
            <Repeat size={18} />
            {repeatMode === 'one' && <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-brand-dark px-0.5">1</span>}
          </button>
        </div>

        <div className="w-full hidden md:flex items-center justify-center gap-2 text-xs text-brand-light font-mono max-w-[80%]">
          <span className="w-10 text-right">{formatTime(progress)}</span>
          <div 
            className="flex-1 h-1 bg-white/10 rounded-full cursor-pointer group relative"
            onClick={handleSeek}
          >
            <div 
              className="h-full bg-white rounded-full group-hover:bg-brand-beige transition-colors relative" 
              style={{ width: `${(progress / duration) * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity scale-125"></div>
            </div>
          </div>
          <span className="w-10">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume - Right Column */}
      <div className="flex items-center justify-end gap-2 md:gap-3 justify-self-end w-full text-gray-400 pl-2">
        <div className="flex items-center justify-end gap-2 w-full max-w-[120px] group">
          <button onClick={toggleMute} className="hover:text-white transition-colors flex-shrink-0">
            {isMuted || volume === 0 ? <VolumeX size={18} className="md:w-5 md:h-5" /> : <Volume2 size={18} className="md:w-5 md:h-5" />}
          </button>
          <div 
            className="flex-1 h-1 bg-white/10 rounded-full cursor-pointer overflow-hidden group/vol min-w-[40px]"
            onClick={(e) => {
              const width = e.currentTarget.clientWidth;
              const clickX = e.nativeEvent.offsetX;
              setVolume(clickX / width);
            }}
          >
            <div 
              className={`h-full rounded-full transition-all duration-150 ${isMuted ? 'bg-gray-600' : 'bg-white group-hover/vol:bg-brand-beige'}`} 
              style={{ width: `${isMuted ? 0 : volume * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}