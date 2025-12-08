import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Music, Play, Pause, Heart } from 'lucide-react';
import api, { getCoverUrl } from '../../utils/api';

export default function ArtistsView({ setView, setViewedProfileId, handlePlay, handleLike }) {
  const [artists, setArtists] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  const lastArtistElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    const fetchArtists = async () => {
      setLoading(true);
      try {
        // We can reuse the users endpoint but maybe we should filter by 'hasTracks=true' in backend?
        // For now, let's just fetch users and filter client side or assume the endpoint returns relevant users.
        // Ideally, backend should support ?role=artist or ?hasTracks=true
        const res = await api.get(`/users?page=${page}&limit=10`);
        const data = res.data;
        
        // Filter only users who have tracks
        const artistsData = data.filter(u => u._count.tracks > 0);

        if (data.length === 0) {
            setHasMore(false);
        } else {
            setArtists(prev => {
                const newArtists = artistsData.filter(u => !prev.some(existing => existing.id === u.id));
                return [...prev, ...newArtists];
            });
            if (data.length < 10) setHasMore(false);
        }
      } catch (error) {
        console.error("Error fetching artists:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, [page]);

  const handleArtistClick = (userId) => {
      if (setViewedProfileId) setViewedProfileId(userId);
      setView('public-profile');
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-brand-beige">Discover Artists</h2>
      
      <div className="grid grid-cols-1 gap-8">
        {artists.map((artist, index) => {
            if (artists.length === index + 1) {
                return <ArtistCard ref={lastArtistElementRef} key={artist.id} artist={artist} onClick={() => handleArtistClick(artist.id)} handlePlay={handlePlay} handleLike={handleLike} />;
            } else {
                return <ArtistCard key={artist.id} artist={artist} onClick={() => handleArtistClick(artist.id)} handlePlay={handlePlay} handleLike={handleLike} />;
            }
        })}
      </div>
      
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-beige"></div>
        </div>
      )}
      
      {!hasMore && artists.length > 0 && (
        <div className="text-center text-brand-light py-8">
          You've reached the end of the list.
        </div>
      )}
    </div>
  );
}

const ArtistCard = React.forwardRef(({ artist, onClick, handlePlay, handleLike }, ref) => {
    return (
        <div ref={ref} className="bg-brand-medium/30 border border-brand-light/10 rounded-2xl p-4 md:p-6 hover:bg-brand-medium/50 transition-colors">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Artist Info */}
                <div className="flex-shrink-0 flex flex-col items-center md:items-start gap-4 cursor-pointer" onClick={onClick}>
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-brand-light to-brand-medium p-1 shadow-xl group">
                        <div className="w-full h-full rounded-full bg-brand-dark flex items-center justify-center text-3xl md:text-4xl font-bold text-brand-beige overflow-hidden group-hover:scale-105 transition-transform">
                            {artist.username ? artist.username[0].toUpperCase() : '?'}
                        </div>
                    </div>
                    <div className="text-center md:text-left">
                        <h3 className="text-xl font-bold text-brand-beige hover:underline">{artist.username}</h3>
                        <p className="text-sm text-brand-light">{artist._count.followers} Followers</p>
                        <p className="text-sm text-brand-light">{artist._count.tracks} Tracks</p>
                    </div>
                </div>

                {/* Top Tracks */}
                <div className="flex-1 space-y-3">
                    <h4 className="text-sm font-semibold text-brand-light uppercase tracking-wider mb-2">Top Tracks</h4>
                    {artist.tracks && artist.tracks.length > 0 ? (
                        artist.tracks.map(track => (
                            <div key={track.id} className="flex items-center gap-4 bg-brand-dark/30 p-3 rounded-lg hover:bg-brand-dark/50 transition-colors group">
                                <div className="w-10 h-10 bg-brand-medium rounded flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                                    {track.coverPath ? (
                                        <img src={getCoverUrl(track.coverPath)} alt={track.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <Music size={16} className="text-brand-light" />
                                    )}
                                    <button 
                                        onClick={() => handlePlay(track)}
                                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Play size={16} className="text-white fill-current" />
                                    </button>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h5 className="font-medium text-brand-beige truncate">{track.title}</h5>
                                    <p className="text-xs text-brand-light truncate">{artist.username}</p>
                                </div>
                                <button 
                                    onClick={() => handleLike(track.id)}
                                    className="text-brand-light hover:text-red-500 transition-colors p-2"
                                >
                                    <Heart size={16} />
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-brand-light italic text-sm">No tracks uploaded yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
});
