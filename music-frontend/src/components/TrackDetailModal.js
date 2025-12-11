import React from 'react';
import { X, Play, Heart, MessageCircle, Music } from 'lucide-react';
import TrackCard from './TrackCard';
import { getCoverUrl } from '../utils/api';

const TrackDetailModal = ({ track, relatedTracks, onClose, onPlay, onLike, onComment, user }) => {
  if (!track) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-5xl bg-brand-dark border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[85vh] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/40 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm"
        >
          <X size={24} />
        </button>

        {/* Left: Main Track Focus */}
        <div className="w-full md:w-5/12 relative flex flex-col">
            {/* Background Image Blur */}
            <div className="absolute inset-0 z-0">
                <img 
                    src={getCoverUrl(track.coverPath)} 
                    className="w-full h-full object-cover opacity-40 blur-xl scale-110"
                    alt=""
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-brand-dark/80 to-brand-dark" />
            </div>

            <div className="relative z-10 p-8 flex flex-col items-center justify-center h-full text-center">
                {/* Big Cover */}
                <div className="w-64 h-64 md:w-72 md:h-72 rounded-2xl shadow-2xl shadow-black/50 mb-8 relative group">
                    <img 
                        src={getCoverUrl(track.coverPath)} 
                        className="w-full h-full object-cover rounded-2xl border border-white/10"
                        alt={track.title}
                    />
                    <button 
                        onClick={() => onPlay(track)}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl backdrop-blur-[2px]"
                    >
                        <div className="w-20 h-20 bg-brand-accent hover:bg-brand-accent-hover rounded-full flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                            <Play fill="currentColor" className="ml-2 text-white" size={40} />
                        </div>
                    </button>
                </div>

                <h2 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">{track.title}</h2>
                <p className="text-xl text-brand-light font-medium mb-8">{track.artist}</p>

                {/* Stats Row */}
                <div className="flex items-center justify-center gap-8 w-full bg-white/5 rounded-2xl p-4 backdrop-blur-md border border-white/5">
                    <div className="flex flex-col items-center">
                        <Heart className="text-brand-accent mb-1" size={24} />
                        <span className="text-lg font-bold text-white">{track._count?.likes || 0}</span>
                        <span className="text-xs text-brand-light uppercase tracking-wider">Likes</span>
                    </div>
                    <div className="w-px h-10 bg-white/10"></div>
                    <div className="flex flex-col items-center">
                        <MessageCircle className="text-blue-400 mb-1" size={24} />
                        <span className="text-lg font-bold text-white">{track._count?.comments || 0}</span>
                        <span className="text-xs text-brand-light uppercase tracking-wider">Comments</span>
                    </div>
                    <div className="w-px h-10 bg-white/10"></div>
                    <div className="flex flex-col items-center">
                        <Music className="text-purple-400 mb-1" size={24} />
                        <span className="text-lg font-bold text-white">{track.playCount || 0}</span>
                        <span className="text-xs text-brand-light uppercase tracking-wider">Plays</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Right: "More Like This" (The "Other Cards") */}
        <div className="w-full md:w-7/12 bg-brand-dark/95 p-8 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-brand-accent rounded-full"></span>
                    Similar Vibes
                </h3>
                <span className="text-xs text-brand-light/50 uppercase tracking-widest font-bold">Recommendations</span>
            </div>
            
            {relatedTracks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
                    {relatedTracks.map(related => (
                        <div key={related.id} className="transform hover:-translate-y-1 transition-transform duration-300">
                             <TrackCard 
                                track={related} 
                                user={user}
                                onPlay={onPlay}
                                onLike={onLike}
                                onComment={onComment}
                                // Simplified props for the modal version
                             />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="h-64 flex flex-col items-center justify-center text-brand-light/30 border-2 border-dashed border-brand-light/10 rounded-2xl">
                    <Music size={48} className="mb-4 opacity-50" />
                    <p>No similar tracks found yet.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TrackDetailModal;
