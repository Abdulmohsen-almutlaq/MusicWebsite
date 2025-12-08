import React from 'react';
import UserCard from '../UserCard';
import { ArrowLeft, Users } from 'lucide-react';

const FollowersView = ({ 
  loadingSocial, 
  followersList, 
  followingList, 
  handleFollow, 
  handleUnfollow, 
  user, 
  setView 
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setView('profile')} className="p-2 hover:bg-brand-light/10 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-3xl font-bold">Followers</h2>
      </div>
      
      {loadingSocial ? (
        <div className="text-center py-20">
          <div className="animate-spin w-12 h-12 border-4 border-brand-light border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : followersList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {followersList.map(follower => (
            <UserCard 
              key={follower.id} 
              user={follower} 
              isFollowing={followingList.some(f => f.id === follower.id)} // Check if we follow them back
              onFollow={handleFollow}
              onUnfollow={handleUnfollow}
              isCurrentUser={follower.id === user.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 opacity-50">
          <Users size={64} className="mx-auto mb-4" />
          <p className="text-xl">No followers yet.</p>
        </div>
      )}
    </div>
  );
};

export default FollowersView;
