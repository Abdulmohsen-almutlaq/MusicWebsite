import React, { memo } from 'react';
import { UserPlus, UserMinus, User } from 'lucide-react';

const UserCard = memo(({ user, isFollowing, onFollow, onUnfollow, isCurrentUser }) => {
  return (
    <div className="flex items-center gap-4 hover:bg-brand-medium/60 transition-colors group">
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-light to-brand-medium p-0.5 shadow-lg flex-shrink-0">
        <div className="w-full h-full rounded-full bg-brand-dark flex items-center justify-center text-lg font-bold text-brand-beige overflow-hidden">
          {user.username ? user.username[0].toUpperCase() : <User size={20} />}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-brand-beige truncate">{user.username || 'Unknown User'}</h4>
        <p className="text-xs text-brand-light truncate">
          {user._count?.followedBy || 0} Followers
        </p>
      </div>

      {/* Action Button */}
      {!isCurrentUser && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            isFollowing ? onUnfollow(user.id) : onFollow(user.id);
          }}
          className={`p-2 rounded-full transition-all ${
            isFollowing 
              ? 'text-brand-light hover:text-red-400 border border-brand-light/20' 
              : 'text-brand-beige hover:scale-105 shadow-lg'
          }`}
          title={isFollowing ? "Unfollow" : "Follow"}
        >
          {isFollowing ? <UserMinus size={18} /> : <UserPlus size={18} />}
        </button>
      )}
    </div>
  );
});

export default UserCard;
