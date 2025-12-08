import React from 'react';
import PlaylistCard from '../PlaylistCard';
import TrackCard from '../TrackCard';
import { Music, Upload, Heart } from 'lucide-react';

const LibraryView = ({ 
  loadingLibrary, 
  libraryPlaylists, 
  likedPlaylists = [],
  libraryUploads, 
  handlePlayPlaylist, 
  handleDeletePlaylist, 
  handleDeleteTrack,
  user, 
  handlePlay, 
  handleLike, 
  handleComment 
}) => {
  return (
    <div className="space-y-12">
      {loadingLibrary ? (
        <div className="text-center py-20">
          <div className="animate-spin w-12 h-12 border-4 border-brand-light border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : (
        <>
          {/* Liked Playlists */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Heart size={24} /> Liked Playlists
            </h2>
            {likedPlaylists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {likedPlaylists.map(playlist => (
                  <PlaylistCard 
                    key={playlist.id} 
                    playlist={playlist} 
                    onPlay={handlePlayPlaylist}
                    // No delete for liked playlists, maybe unlike?
                    // For now just show them.
                  />
                ))}
              </div>
            ) : (
              <p className="text-brand-light/50 italic">No liked playlists yet.</p>
            )}
          </section>

          {/* My Playlists */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Music size={24} /> My Playlists
            </h2>
            {libraryPlaylists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {libraryPlaylists.map(playlist => (
                  <PlaylistCard 
                    key={playlist.id} 
                    playlist={playlist} 
                    onPlay={handlePlayPlaylist}
                    onDelete={handleDeletePlaylist}
                  />
                ))}
              </div>
            ) : (
              <p className="text-brand-light/50 italic">No playlists created yet.</p>
            )}
          </section>

          {/* My Uploads */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Upload size={24} /> My Uploads
            </h2>
            {libraryUploads.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {libraryUploads.map(track => (
                  <TrackCard 
                    key={track.id} 
                    track={track} 
                    user={user}
                    onPlay={handlePlay}
                    onLike={handleLike}
                    onComment={handleComment}
                    onDelete={handleDeleteTrack}
                  />
                ))}
              </div>
            ) : (
              <p className="text-brand-light/50 italic">You haven't uploaded any tracks yet.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default LibraryView;
