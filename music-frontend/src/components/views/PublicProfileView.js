import React, { useState, useEffect } from 'react';
import { Camera, Mail, Calendar, Music, Disc, ArrowLeft, UserPlus, UserCheck, Heart } from 'lucide-react';
import TrackCard from '../TrackCard';
import api from '../../utils/api';

const PublicProfileView = ({ viewedProfileId, setView, handlePlay, handleLike, handleLikePlaylist, handleComment, user: currentUser, followingList = [], handleFollow, handleUnfollow, fetchFollowing }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser && fetchFollowing) {
        fetchFollowing(currentUser.id);
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!viewedProfileId) return;
      setLoading(true);
      try {
        const res = await api.get(`/users/${viewedProfileId}`);
        setProfile(res.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [viewedProfileId]);

  const onLikePlaylistClick = async (playlistId) => {
      if (handleLikePlaylist) {
          await handleLikePlaylist(playlistId);
          // Optimistic update
          setProfile(prev => ({
              ...prev,
              recentPlaylists: prev.recentPlaylists.map(pl => {
                  if (pl.id === playlistId) {
                      const isLiked = !pl.isLiked;
                      return {
                          ...pl,
                          isLiked,
                          likeCount: isLiked ? pl.likeCount + 1 : pl.likeCount - 1
                      };
                  }
                  return pl;
              })
          }));
      }
  };

  if (loading) return <div className="text-center py-20 text-brand-light">Loading profile...</div>;
  if (!profile) return <div className="text-center py-20 text-brand-light">User not found.</div>;

  const isFollowing = followingList.some(u => u.id === viewedProfileId);
  const isMe = currentUser?.id === viewedProfileId;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button onClick={() => setView('social')} className="flex items-center gap-2 text-brand-light hover:text-brand-beige transition-colors">
        <ArrowLeft size={20} /> Back to Community
      </button>

      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-brand-medium to-brand-dark border border-brand-light/20 rounded-3xl p-4 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-light/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 relative z-10">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-brand-light to-brand-medium p-1 shadow-xl">
              <div className="w-full h-full rounded-full bg-brand-dark flex items-center justify-center text-3xl md:text-4xl font-bold text-brand-beige overflow-hidden">
                {profile.username ? profile.username[0].toUpperCase() : '?'}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="text-center md:text-left flex-1 w-full">
            <h1 className="text-3xl md:text-4xl font-bold text-brand-beige mb-2">{profile.username}</h1>
            <div className="flex flex-col md:flex-row items-center gap-4 text-brand-light/80 text-sm mb-6 justify-center md:justify-start">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} /> Joined {new Date(profile.joinedAt).getFullYear()}
              </span>
              {!isMe && (
                  <button 
                    onClick={() => isFollowing ? handleUnfollow(viewedProfileId) : handleFollow(viewedProfileId)}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${isFollowing ? 'bg-brand-light text-brand-dark hover:bg-red-500 hover:text-white' : 'bg-brand-beige text-brand-dark hover:bg-white'}`}
                  >
                      {isFollowing ? <><UserCheck size={16} /> Following</> : <><UserPlus size={16} /> Follow</>}
                  </button>
              )}
            </div>
            
            <div className="flex gap-6 justify-center md:justify-start">
                <div className="text-center">
                    <div className="text-xl font-bold text-brand-beige">{profile.stats.followers}</div>
                    <div className="text-xs text-brand-light uppercase tracking-wider">Followers</div>
                </div>
                <div className="text-center">
                    <div className="text-xl font-bold text-brand-beige">{profile.stats.following}</div>
                    <div className="text-xs text-brand-light uppercase tracking-wider">Following</div>
                </div>
                <div className="text-center">
                    <div className="text-xl font-bold text-brand-beige">{profile.stats.tracks}</div>
                    <div className="text-xs text-brand-light uppercase tracking-wider">Tracks</div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Public Tracks */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-brand-beige flex items-center gap-2">
            <Music className="text-brand-light" /> Public Tracks
        </h2>
        {profile.recentTracks && profile.recentTracks.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
                {profile.recentTracks.map(track => (
                    <TrackCard 
                        key={track.id} 
                        track={{...track, user: { username: profile.username, id: profile.id }}} 
                        onPlay={handlePlay}
                        onLike={handleLike}
                        onComment={handleComment}
                        isOwner={false}
                    />
                ))}
            </div>
        ) : (
            <p className="text-brand-light italic">No public tracks yet.</p>
        )}
      </div>

      {/* Public Playlists */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-brand-beige flex items-center gap-2">
            <Disc className="text-brand-light" /> Public Playlists
        </h2>
        {profile.recentPlaylists && profile.recentPlaylists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.recentPlaylists.map(pl => (
                    <div key={pl.id} className="bg-brand-medium/30 p-4 rounded-lg border border-brand-light/10 flex items-center gap-4 justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-brand-dark rounded flex items-center justify-center">
                                <Disc size={24} className="text-brand-light" />
                            </div>
                            <div>
                                <h3 className="font-bold text-brand-beige">{pl.name}</h3>
                                <p className="text-xs text-brand-light">Playlist • {pl.likeCount || 0} Likes</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => onLikePlaylistClick(pl.id)}
                            className={`p-2 rounded-full transition-colors ${pl.isLiked ? 'text-red-500 bg-red-500/10' : 'text-brand-light hover:text-red-500 hover:bg-brand-light/10'}`}
                        >
                            <Heart size={20} fill={pl.isLiked ? "currentColor" : "none"} />
                        </button>
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-brand-light italic">No public playlists yet.</p>
        )}
      </div>
    </div>
  );
};

export default PublicProfileView;
