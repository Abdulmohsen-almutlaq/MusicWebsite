import React, { useState } from 'react';
import { User, Music, Disc, X } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { getCoverUrl } from '../utils/api';

const SocialRow = ({ users, onPlayPlaylist }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const { playTrack } = usePlayer();

  if (!users || users.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <User size={20} className="text-purple-500" />
        Connect with Creators
      </h3>
      
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {users.map(user => (
          <div 
            key={user.id}
            className="relative group flex-shrink-0 cursor-pointer"
            onClick={() => setSelectedUser(user)}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 p-0.5 transition-transform transform group-hover:scale-105">
              <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                 {/* Placeholder for avatar if no image */}
                 <span className="text-xl font-bold text-white">
                   {user.username.charAt(0).toUpperCase()}
                 </span>
              </div>
            </div>
            <p className="text-xs text-center text-gray-400 mt-2 truncate w-16">
              {user.username}
            </p>
            
            {/* Online/Active Indicator (Mock) */}
            <div className="absolute bottom-6 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
          </div>
        ))}
      </div>

      {/* Popover / Modal for Selected User */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSelectedUser(null)}>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-80 shadow-2xl transform transition-all scale-100 relative" onClick={e => e.stopPropagation()}>
            
            <button 
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold text-white">
                {selectedUser.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="text-xl font-bold text-white">{selectedUser.username}</h4>
                <p className="text-sm text-gray-400">{selectedUser._count?.tracks || 0} Tracks • {selectedUser._count?.followedBy || 0} Followers</p>
              </div>
            </div>

            <div className="space-y-4">
              {selectedUser.tracks && selectedUser.tracks.length > 0 && (
                <div className="bg-gray-800/50 rounded-lg p-3 hover:bg-gray-800 transition-colors cursor-pointer group"
                     onClick={() => {
                       playTrack(selectedUser.tracks[0]);
                       setSelectedUser(null);
                     }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-purple-400 uppercase tracking-wider">Top Track</span>
                    <Music size={14} className="text-gray-500 group-hover:text-white" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-gray-700 flex-shrink-0 overflow-hidden">
                      {selectedUser.tracks[0].coverPath ? (
                        <img src={getCoverUrl(selectedUser.tracks[0].coverPath)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-600"><Music size={16} /></div>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium text-white truncate">{selectedUser.tracks[0].title}</p>
                      <p className="text-xs text-gray-400 truncate">{selectedUser.tracks[0].artist}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedUser.playlists && selectedUser.playlists.length > 0 && (
                <div className="bg-gray-800/50 rounded-lg p-3 hover:bg-gray-800 transition-colors cursor-pointer group"
                     onClick={() => {
                       if (onPlayPlaylist) {
                         onPlayPlaylist(selectedUser.playlists[0]);
                       }
                       setSelectedUser(null);
                     }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">Latest Playlist</span>
                    <Disc size={14} className="text-gray-500 group-hover:text-white" />
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded bg-gray-700 flex-shrink-0 flex items-center justify-center">
                        <Disc size={20} className="text-gray-400" />
                     </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium text-white truncate">{selectedUser.playlists[0].name}</p>
                      <p className="text-xs text-gray-400 truncate">{selectedUser.playlists[0].tracks.length} Tracks</p>
                    </div>
                  </div>
                </div>
              )}
              
              {(!selectedUser.tracks?.length && !selectedUser.playlists?.length) && (
                <p className="text-sm text-gray-500 text-center py-4">No public content yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialRow;
