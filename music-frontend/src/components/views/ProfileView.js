import React, { useEffect } from 'react';
import { Camera, Mail, Calendar, Edit2, Upload, List, Heart, Users, UserPlus } from 'lucide-react';

const ProfileView = ({ user, libraryUploads, libraryPlaylists, setView, followersList, followingList, fetchFollowers, fetchFollowing }) => {
  
  useEffect(() => {
    if (user) {
      fetchFollowers(user.id);
      fetchFollowing(user.id);
    }
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-brand-medium to-brand-dark border border-brand-light/20 rounded-3xl p-4 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-light/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 relative z-10">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-brand-light to-brand-medium p-1 shadow-xl">
              <div className="w-full h-full rounded-full bg-brand-dark flex items-center justify-center text-3xl md:text-4xl font-bold text-brand-beige overflow-hidden">
                {user.email[0].toUpperCase()}
              </div>
            </div>
            <button className="absolute bottom-0 right-0 bg-brand-light text-brand-beige p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
              <Camera size={16} />
            </button>
          </div>

          {/* Info */}
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-brand-beige mb-2">{user.username || 'Music Lover'}</h1>
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-brand-light/80 text-sm mb-6">
              <span className="flex items-center gap-1.5">
                <Mail size={14} /> {user.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} /> Joined {new Date().getFullYear()}
              </span>
            </div>
            <button 
              onClick={() => setView('settings')}
              className="bg-brand-light/10 hover:bg-brand-light/20 text-brand-beige border border-brand-light/30 px-6 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 mx-auto md:mx-0"
            >
              <Edit2 size={14} /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-brand-medium/40 border border-brand-light/10 p-4 md:p-6 rounded-2xl flex items-center gap-4 hover:bg-brand-medium/60 transition-colors">
          <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
            <Upload size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-beige">{libraryUploads.length}</p>
            <p className="text-xs text-brand-light uppercase tracking-wider">Uploads</p>
          </div>
        </div>
        
        <div className="bg-brand-medium/40 border border-brand-light/10 p-4 md:p-6 rounded-2xl flex items-center gap-4 hover:bg-brand-medium/60 transition-colors">
          <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center">
            <List size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-beige">{libraryPlaylists.length}</p>
            <p className="text-xs text-brand-light uppercase tracking-wider">Playlists</p>
          </div>
        </div>

        <div className="bg-brand-medium/40 border border-brand-light/10 p-4 md:p-6 rounded-2xl flex items-center gap-4 hover:bg-brand-medium/60 transition-colors">
          <div className="w-12 h-12 bg-pink-500/20 text-pink-400 rounded-xl flex items-center justify-center">
            <Heart size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-beige">0</p>
            <p className="text-xs text-brand-light uppercase tracking-wider">Likes Received</p>
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <button 
          onClick={() => setView('followers')}
          className="bg-brand-medium/30 border border-brand-light/10 p-4 md:p-6 rounded-2xl flex items-center justify-between hover:bg-brand-medium/50 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-light/10 text-brand-light rounded-xl flex items-center justify-center group-hover:bg-brand-light group-hover:text-brand-dark transition-colors">
              <Users size={24} />
            </div>
            <div className="text-left">
              <p className="text-lg font-bold text-brand-beige">{followersList ? followersList.length : 0}</p>
              <p className="text-xs text-brand-light">Followers</p>
            </div>
          </div>
        </button>

        <button 
          onClick={() => setView('following')}
          className="bg-brand-medium/30 border border-brand-light/10 p-6 rounded-2xl flex items-center justify-between hover:bg-brand-medium/50 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-light/10 text-brand-light rounded-xl flex items-center justify-center group-hover:bg-brand-light group-hover:text-brand-dark transition-colors">
              <UserPlus size={24} />
            </div>
            <div className="text-left">
              <p className="text-lg font-bold text-brand-beige">{followingList ? followingList.length : 0}</p>
              <p className="text-xs text-brand-light">Following</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ProfileView;
