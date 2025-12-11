import { Play, Heart, MessageCircle, Share2, MoreHorizontal, ListPlus, Plus, X, User, Trash2, Music } from 'lucide-react';
import React, { useState, useMemo, memo } from 'react';
import api, { getCoverUrl } from '../utils/api';

const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%231B3C53'/%3E%3Ctext x='150' y='150' font-family='sans-serif' font-size='24' fill='%23456882' text-anchor='middle' dy='.3em'%3ENo Cover%3C/text%3E%3C/svg%3E";

const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(num || 0);
};

const TrackCard = memo(({ track, user, onPlay, onLike, onComment, onDelete }) => {
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Playlist State
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [playlistMessage, setPlaylistMessage] = useState('');

  // Use loose equality (==) to handle potential string/number mismatches between user.id and like.userId
  const isLiked = track.likes?.some(like => like.userId == user?.id);

  const fetchPlaylists = async () => {
    if (!user) return;
    setLoadingPlaylists(true);
    try {
      const { data } = await api.get('/playlists');
      setUserPlaylists(data);
    } catch (err) {
      console.error("Failed to fetch playlists", err);
    } finally {
      setLoadingPlaylists(false);
    }
  };

  const togglePlaylistMenu = () => {
    if (!showPlaylistMenu) {
      fetchPlaylists();
      setShowPlaylistMenu(true);
    } else {
      setIsClosing(true);
      setTimeout(() => {
        setShowPlaylistMenu(false);
        setIsClosing(false);
        setShowCreateForm(false);
        setPlaylistMessage('');
      }, 200);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    try {
      const { data } = await api.post('/playlists', { 
        name: newPlaylistName, 
        description: newPlaylistDesc,
        isPublic: false 
      });
      setUserPlaylists([data, ...userPlaylists]);
      setNewPlaylistName('');
      setNewPlaylistDesc('');
      setShowCreateForm(false);
      setPlaylistMessage('Playlist created!');
      setTimeout(() => setPlaylistMessage(''), 2000);
    } catch (err) {
      console.error("Failed to create playlist", err);
    }
  };

  const addToPlaylist = async (playlistId) => {
    try {
      await api.post(`/playlists/${playlistId}/tracks`, { trackId: track.id });
      setPlaylistMessage('Added to playlist!');
      setTimeout(() => {
        setIsClosing(true);
        setTimeout(() => {
          setPlaylistMessage('');
          setShowPlaylistMenu(false);
          setIsClosing(false);
        }, 200);
      }, 800);
    } catch (err) {
      console.error("Failed to add to playlist", err);
      setPlaylistMessage('Already in playlist or error');
      setTimeout(() => setPlaylistMessage(''), 2000);
    }
  };

  const coverUrl = useMemo(() => {
    if (!track.coverPath || imgError) return PLACEHOLDER_IMAGE;
    return getCoverUrl(track.coverPath);
  }, [track.coverPath, imgError]);

  const handleCommentSubmit = () => {
    if (!comment.trim()) return;
    onComment(track.id, comment);
    setComment('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCommentSubmit();
    }
  };

  const hasCover = !!track.coverPath && !imgError;
  
  // Generate a consistent color based on track title
  const seed = (track.title || '').split('').reduce((a,c) => a + c.charCodeAt(0), 0);
  const hue = seed % 360;
  const gradientStyle = !hasCover ? {
    background: `linear-gradient(135deg, hsl(${hue}, 40%, 20%) 0%, hsl(${(hue + 40) % 360}, 30%, 15%) 100%)`
  } : {};

  return (
    <div 
      className={`relative group flex flex-col w-full min-h-[400px] transition-all duration-300 rounded-2xl overflow-hidden ${
        hasCover 
          ? 'border border-brand-light/10' 
          : 'border border-white/5 hover:border-white/10'
      } ${showPlaylistMenu ? 'z-50' : ''}`}
      style={!hasCover ? gradientStyle : {}}
    >
      {hasCover ? (
        <>
          {/* Full Bleed Cover Image */}
          <div className="absolute inset-0 z-0">
            <img 
              src={coverUrl} 
              alt={track.title}
              loading="lazy"
              className="w-full h-full object-cover transform transition-transform duration-700 ease-out group-hover:scale-110"
              onError={() => setImgError(true)}
            />
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90" />
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 flex flex-col flex-1 p-5 pointer-events-none">
            {/* Top: Genre/User */}
            <div className="flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-300">
               {track.genre && (
                 <span className="text-[10px] font-medium uppercase tracking-wider text-white/90 bg-black/30 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
                   {track.genre}
                 </span>
               )}
            </div>

            {/* Center: Play Button */}
            <div className="flex-1 flex items-center justify-center pointer-events-auto">
                <button 
                  onClick={() => onPlay(track)}
                  className="w-16 h-16 bg-brand-accent hover:bg-brand-accent-hover text-brand-beige rounded-full flex items-center justify-center shadow-lg shadow-black/50 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 active:scale-95"
                  aria-label={`Play ${track.title}`}
                >
                  <Play fill="currentColor" className="ml-1" size={28} />
                </button>
            </div>

            {/* Bottom: Info */}
            <div className="mt-auto mb-2 pointer-events-auto relative z-20">
                <h3 className="font-bold text-white text-xl leading-tight mb-1 drop-shadow-md line-clamp-2">
                  {track.title}
                </h3>
                <p className="text-sm text-white/90 hover:text-white transition-colors cursor-pointer font-medium line-clamp-1">
                  {track.artist}
                </p>
                {track.user && (
                  <p className="text-xs text-white/70 mt-1 font-light">
                    Uploaded by <span className="font-medium text-white/90">{track.user.username}</span>
                  </p>
                )}
            </div>
          </div>
        </>
      ) : (
        /* Poster Layout for No Cover */
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 relative z-10">
           {/* Decorative Icon */}
           <Music className="absolute top-4 right-4 text-white/5" size={64} />
           
           {/* Play Button */}
           <button 
              onClick={() => onPlay(track)}
              className="mb-6 w-16 h-16 bg-white/10 hover:bg-white/20 text-brand-beige rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 group-hover:shadow-lg shadow-black/20"
           >
              <Play fill="currentColor" className="ml-1" size={28} />
           </button>

           <h3 className="font-black text-2xl text-brand-beige leading-tight mb-2 line-clamp-3">
             {track.title}
           </h3>
           <p className="text-sm font-medium text-brand-light/80 uppercase tracking-wider mb-1">
             {track.artist}
           </p>
           {track.user && (
             <p className="text-xs text-brand-light/60 mt-1 mb-2">
               Uploaded by <span className="text-brand-light/80">{track.user.username}</span>
             </p>
           )}
           {track.genre && (
             <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-brand-light/60 mt-2">
               {track.genre}
             </span>
           )}
        </div>
      )}

      {/* Actions Bar */}
      <div className={`flex items-center justify-between pt-4 mt-auto relative z-20 ${hasCover ? 'px-5 pb-5 border-t border-white/10' : 'px-6 pb-4 border-t border-white/5'}`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onLike(track.id)}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              isLiked ? "text-brand-accent" : (hasCover ? "text-white/70 hover:text-brand-accent" : "text-brand-light hover:text-brand-accent")
            }`}
            title={isLiked ? "Unlike" : "Like"}
          >
            <Heart size={18} className={isLiked ? "fill-current" : ""} />
            <span className="font-medium">{formatNumber(track._count?.likes)}</span>
          </button>
          
          <button  
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              showComments ? "text-blue-400" : (hasCover ? "text-white/70 hover:text-blue-400" : "text-brand-light hover:text-blue-400")
            }`}
            title="Comments"
          >
            <MessageCircle size={18} className={showComments ? "fill-current" : ""} />
            <span className="font-medium">{formatNumber(track._count?.comments)}</span>
          </button>

          {/* Playlist Button & Popover */}
          <div className="relative">
            <button 
              onClick={togglePlaylistMenu}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                showPlaylistMenu ? "text-brand-beige" : (hasCover ? "text-white/70 hover:text-white" : "text-brand-light hover:text-brand-beige")
              }`}
              title="Add to Playlist"
            >
              <ListPlus size={18} />
            </button>

            {showPlaylistMenu && (
              <div className={`absolute bottom-full left-0 mb-2 w-64 bg-brand-medium border border-brand-light/20 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-200 ${isClosing ? 'animate-out fade-out zoom-out-95 duration-200' : ''}`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-brand-light/10">
                  <h4 className="text-sm font-bold text-brand-beige">Add to Playlist</h4>
                  <button onClick={togglePlaylistMenu} className="text-brand-light hover:text-brand-beige">
                    <X size={14} />
                  </button>
                </div>

                {/* Message Feedback */}
                {playlistMessage && (
                  <div className="mb-2 text-xs text-green-400 text-center bg-green-900/20 p-1 rounded">
                    {playlistMessage}
                  </div>
                )}

                {/* Create Form */}
                {showCreateForm ? (
                  <form onSubmit={handleCreatePlaylist} className="space-y-2">
                    <input
                      type="text"
                      placeholder="Playlist Name"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      className="w-full bg-brand-dark/50 border border-brand-light/20 rounded px-2 py-1.5 text-xs text-brand-beige focus:border-brand-light/50 outline-none"
                      autoFocus
                    />
                    <input
                      type="text"
                      placeholder="Description (optional)"
                      value={newPlaylistDesc}
                      onChange={(e) => setNewPlaylistDesc(e.target.value)}
                      className="w-full bg-brand-dark/50 border border-brand-light/20 rounded px-2 py-1.5 text-xs text-brand-beige focus:border-brand-light/50 outline-none"
                    />
                    <div className="flex gap-2 pt-1">
                      <button 
                        type="button" 
                        onClick={() => setShowCreateForm(false)}
                        className="flex-1 px-2 py-1 text-xs text-brand-light hover:text-brand-beige bg-brand-dark border border-brand-light/20 rounded transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        disabled={!newPlaylistName.trim()}
                        className="flex-1 px-2 py-1 text-xs bg-brand-light text-brand-beige rounded hover:bg-brand-light/80 disabled:opacity-50"
                      >
                        Create
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    {/* Playlist List */}
                    <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1 mb-2">
                      {loadingPlaylists ? (
                        <div className="text-center py-4 text-xs text-brand-light">Loading...</div>
                      ) : userPlaylists.length === 0 ? (
                        <div className="text-center py-4 text-xs text-brand-light/50 italic">No playlists yet</div>
                      ) : (
                        userPlaylists.map(pl => (
                          <button
                            key={pl.id}
                            onClick={() => addToPlaylist(pl.id)}
                            className="w-full text-left px-2 py-1.5 rounded hover:bg-brand-light/10 text-xs text-brand-light hover:text-brand-beige truncate transition-colors flex items-center gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-light/50"></span>
                            {pl.name}
                          </button>
                        ))
                      )}
                    </div>

                    {/* Create Button */}
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 border border-dashed border-brand-light/30 rounded hover:bg-brand-light/5 text-xs text-brand-light hover:text-brand-beige transition-colors"
                    >
                      <Plus size={12} />
                      <span>New Playlist</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Delete Button (Owner Only) */}
          {onDelete && user && (track.userId == user.id || (track.user && track.user.id == user.id)) && (
            <button 
              onClick={() => onDelete(track.id)}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                hasCover ? "text-white/70 hover:text-brand-error" : "text-brand-light hover:text-brand-error"
              }`}
              title="Delete Track"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
        
        <div className={`flex items-center gap-3 text-xs font-medium ${hasCover ? "text-white/60" : "text-brand-light/70"}`}>
          <span>{formatNumber(track.playCount)} plays</span>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-brand-light/10 animate-in fade-in slide-in-from-top-2 duration-200 relative z-30 bg-brand-dark/90 backdrop-blur-md p-4 rounded-xl">
          <div className="space-y-3 mb-4 max-h-40 overflow-y-auto custom-scrollbar pr-2">
            {track.comments?.length > 0 ? (
              track.comments.map(c => (
                <div key={c.id} className="group/comment">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-bold text-brand-light">
                      {c.user?.username || c.user?.email?.split('@')[0] || 'User'}
                    </span>
                    <span className="text-[10px] text-brand-light/60">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-white/90 mt-0.5 break-words leading-relaxed">
                    {c.content}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-white/50 text-center py-2 italic">No comments yet. Be the first!</p>
            )}
          </div>
          
          <div className="relative">
            <input 
              type="text" 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write a comment..."
              className="w-full bg-brand-dark/50 border border-brand-light/20 rounded-full pl-4 pr-12 py-2 text-sm text-white placeholder-white/50 focus:ring-2 focus:ring-brand-light/50 focus:border-brand-light/50 outline-none transition-all"
            />
            <button 
              onClick={handleCommentSubmit}
              disabled={!comment.trim()}
              className="absolute right-1.5 top-1.5 p-1.5 bg-brand-light text-brand-beige rounded-full hover:bg-brand-light/80 disabled:opacity-50 disabled:hover:bg-brand-light transition-colors"
            >
              <Share2 size={14} className="ml-0.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default TrackCard;