import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Music, Disc, UserPlus, UserCheck } from 'lucide-react';
import api from '../../utils/api';

export default function SocialView({ setView, setViewedProfileId, user: currentUser, followingList = [], handleFollow, handleUnfollow, fetchFollowing }) {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  useEffect(() => {
    if (currentUser && fetchFollowing) {
        fetchFollowing(currentUser.id);
    }
  }, []);

  const lastUserElementRef = useCallback(node => {
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
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/users?page=${page}&limit=12`);
        const data = res.data;
        
        if (data.length === 0) {
            setHasMore(false);
        } else {
            setUsers(prevUsers => {
                const newUsers = data.filter(u => !prevUsers.some(existing => existing.id === u.id));
                return [...prevUsers, ...newUsers];
            });
            if (data.length < 12) setHasMore(false);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page]);

  const handleUserClick = (userId) => {
      if (setViewedProfileId) setViewedProfileId(userId);
      setView('public-profile');
  };

  const isFollowing = (userId) => followingList.some(u => u.id === userId);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-brand-beige">Community</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {users.map((user, index) => {
            const following = isFollowing(user.id);
            const isMe = currentUser?.id === user.id;
            const props = {
                user,
                onClick: () => handleUserClick(user.id),
                isFollowing: following,
                onFollow: () => handleFollow(user.id),
                onUnfollow: () => handleUnfollow(user.id),
                isMe
            };

            if (users.length === index + 1) {
                return <UserCard ref={lastUserElementRef} key={user.id} {...props} />;
            } else {
                return <UserCard key={user.id} {...props} />;
            }
        })}
      </div>
      
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-beige"></div>
        </div>
      )}
      
      {!hasMore && users.length > 0 && (
        <div className="text-center text-brand-light py-8">
          You've reached the end of the list.
        </div>
      )}
    </div>
  );
}

const UserCard = React.forwardRef(({ user, onClick, isFollowing, onFollow, onUnfollow, isMe }, ref) => {
    return (
        <div ref={ref} className="bg-brand-medium/50 p-6 rounded-xl hover:bg-brand-medium transition-colors group cursor-pointer border border-transparent hover:border-brand-light/20 relative" onClick={onClick}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-light rounded-full flex items-center justify-center text-xl font-bold text-brand-beige">
                        {user.username ? user.username[0].toUpperCase() : '?'}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-brand-beige group-hover:text-white transition-colors">{user.username}</h3>
                        <p className="text-xs text-brand-light">{user._count.followedBy} Followers • {user._count.tracks} Tracks</p>
                    </div>
                </div>
                {!isMe && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            isFollowing ? onUnfollow() : onFollow();
                        }}
                        className={`p-2 rounded-full transition-colors ${isFollowing ? 'bg-brand-light text-brand-dark hover:bg-red-500 hover:text-white' : 'bg-brand-dark text-brand-light hover:bg-brand-light hover:text-brand-dark'}`}
                        title={isFollowing ? "Unfollow" : "Follow"}
                    >
                        {isFollowing ? <UserCheck size={18} /> : <UserPlus size={18} />}
                    </button>
                )}
            </div>
            
            {/* Mini Preview of Tracks */}
            {user.tracks && user.tracks.length > 0 && (
                <div className="space-y-2 mt-4">
                    <p className="text-xs font-semibold text-brand-light uppercase tracking-wider">Recent Uploads</p>
                    {user.tracks.map(track => (
                        <div key={track.id} className="flex items-center gap-2 text-sm text-brand-light/80">
                            <Music size={12} />
                            <span className="truncate">{track.title}</span>
                        </div>
                    ))}
                </div>
            )}
             {/* Mini Preview of Playlists */}
             {user.playlists && user.playlists.length > 0 && (
                <div className="space-y-2 mt-4">
                    <p className="text-xs font-semibold text-brand-light uppercase tracking-wider">Public Playlists</p>
                    {user.playlists.map(pl => (
                        <div key={pl.id} className="flex items-center gap-2 text-sm text-brand-light/80">
                            <Disc size={12} />
                            <span className="truncate">{pl.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});
