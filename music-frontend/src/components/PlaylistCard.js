import { Play, Pause, Trash2, Music, MoreVertical, Disc } from 'lucide-react';
import { useMemo, useState, memo } from 'react';
import { getCoverUrl } from '../utils/api';
import { usePlayer } from '../context/PlayerContext';

const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%231B3C53'/%3E%3Ctext x='150' y='150' font-family='sans-serif' font-size='24' fill='%23456882' text-anchor='middle' dy='.3em'%3EPlaylist%3C/text%3E%3C/svg%3E";

const PlaylistCard = memo(({ playlist, onPlay, onDelete }) => {
  const { currentTrack, isPlaying, togglePlay } = usePlayer();
  const [imgError, setImgError] = useState(false);

  // Extract covers from playlist tracks
  // Handles structure where track might be direct or nested in a join object
  const covers = useMemo(() => {
    if (!playlist.tracks || playlist.tracks.length === 0) return [];
    
    return playlist.tracks
      .map(t => {
        // Handle both direct track object or nested { track: ... } structure from Prisma
        const trackData = t.track || t; 
        return trackData.coverPath;
      })
      .filter(Boolean)
      .slice(0, 4);
  }, [playlist.tracks]);

  // Check if this playlist is currently active (heuristic based on visible tracks)
  const isCurrentPlaylist = useMemo(() => {
    if (!currentTrack || !playlist.tracks) return false;
    return playlist.tracks.some(t => (t.track?.id || t.id) === currentTrack.id);
  }, [currentTrack, playlist.tracks]);

  const isThisPlaying = isCurrentPlaylist && isPlaying;

  const handlePlayClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (isCurrentPlaylist) {
      togglePlay();
    } else {
      onPlay && onPlay(playlist);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (window.confirm(`Delete playlist "${playlist.name}"?`)) {
      onDelete && onDelete(playlist.id);
    }
  };

  // Determine grid layout based on number of covers
  const renderCover = () => {
    if (covers.length === 0 || imgError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-brand-medium text-brand-light/30">
          <Disc size={48} />
        </div>
      );
    }

    if (covers.length < 4) {
      return (
        <img 
          src={getCoverUrl(covers[0])} 
          alt={playlist.name}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      );
    }

    return (
      <div className="grid grid-cols-2 h-full w-full">
        {covers.map((cover, i) => (
          <img 
            key={i}
            src={getCoverUrl(cover)}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="group relative bg-brand-medium/40 backdrop-blur-sm border border-brand-light/10 hover:bg-brand-medium/60 hover:border-brand-light/20 transition-all duration-300 p-4 rounded-2xl flex flex-col h-full cursor-pointer">
      
      {/* Cover Art Area */}
      <div className="relative aspect-square mb-4 rounded-xl overflow-hidden shadow-2xl bg-brand-dark group-hover:shadow-brand-light/20 transition-shadow duration-500">
        {renderCover()}
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-brand-dark/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Play Button */}
        <button 
          onClick={handlePlayClick}
          className={`absolute bottom-4 right-4 w-12 h-12 bg-brand-light hover:bg-brand-light/80 text-brand-beige rounded-full flex items-center justify-center shadow-lg shadow-brand-dark/50 transition-all duration-300 hover:scale-110 active:scale-95 z-20 ${isThisPlaying ? 'opacity-100 translate-y-0' : 'translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'}`}
          aria-label={isThisPlaying ? "Pause" : `Play ${playlist.name}`}
        >
          {isThisPlaying ? (
            <Pause fill="currentColor" size={20} />
          ) : (
            <Play fill="currentColor" className="ml-1" size={20} />
          )}
        </button>
      </div>

      {/* Playlist Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-brand-beige truncate text-lg leading-tight mb-1 group-hover:text-brand-light transition-colors">
          {playlist.name}
        </h3>
        {playlist.creatorName && (
            <p className="text-xs text-brand-light mb-1">by {playlist.creatorName}</p>
        )}
        <p className="text-sm text-brand-light/60 line-clamp-2 mb-2 h-10">
          {playlist.description || "No description"}
        </p>
        
        <div className="flex items-center justify-between pt-3 border-t border-brand-light/10">
          <div className="flex items-center gap-2 text-xs text-brand-light/70">
            <span className="bg-brand-light/10 px-2 py-1 rounded-full border border-brand-light/10">
              {playlist.tracks?.length || 0} tracks
            </span>
          </div>

          {/* Delete Action (Only visible on hover) */}
          {onDelete && (
            <button 
              onClick={handleDeleteClick}
              className="text-brand-light/50 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
              title="Delete Playlist"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default PlaylistCard;