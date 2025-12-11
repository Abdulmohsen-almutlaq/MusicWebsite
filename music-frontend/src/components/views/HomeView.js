import React from 'react';
import TrackCard from '../TrackCard';
import UserCard from '../UserCard';
import PlaylistCard from '../PlaylistCard';
import SkeletonCard from '../SkeletonCard';
import HorizontalSection from '../HorizontalSection';
import SocialRow from '../SocialRow';

const HomeView = ({ newReleases, trending, topRated, suggestedUsers, featuredPlaylists, loading, user, handlePlay, handlePlayPlaylist, handleLike, handleComment, onDelete, handleFollow, handleUnfollow }) => {
  const [greeting, setGreeting] = React.useState('');

  React.useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  if (loading) {
    return (
      <div className="space-y-12">
        <div className="h-10 w-64 bg-brand-light/10 rounded animate-pulse mb-8" />
        {[1, 2, 3].map((section) => (
          <section key={section}>
            <div className="h-8 w-48 bg-brand-light/10 rounded animate-pulse mb-6" />
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="min-w-[250px] w-[250px]">
                  <SkeletonCard />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Greeting Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-brand-beige">
          {greeting}, <span className="text-brand-light">{user?.username || 'Friend'}</span>
        </h1>
        <p className="text-brand-light/60 mt-2">Here's what's happening in your music world today.</p>
      </header>

      {/* Social Row */}
      {suggestedUsers?.length > 0 && (
        <SocialRow users={suggestedUsers} onPlayPlaylist={handlePlayPlaylist} />
      )}

      {(!newReleases?.length && !trending?.length && !topRated?.length && !suggestedUsers?.length && !featuredPlaylists?.length) ? (
        <div className="text-center py-20 opacity-50">
          <p className="text-xl">No content available yet.</p>
        </div>
      ) : (
        <>
          {trending?.length > 0 && (
            <HorizontalSection title="Trending Now">
              {trending.map(track => (
                <div key={track.id} className="min-w-[260px] w-[260px] snap-start">
                  <TrackCard 
                    track={track} 
                    user={user}
                    onPlay={handlePlay}
                    onLike={handleLike}
                    onComment={handleComment}
                    onDelete={onDelete}
                  />
                </div>
              ))}
            </HorizontalSection>
          )}

          {newReleases?.length > 0 && (
            <HorizontalSection title="New Releases">
              {newReleases.map(track => (
                <div key={track.id} className="min-w-[260px] w-[260px] snap-start">
                  <TrackCard 
                    track={track} 
                    user={user}
                    onPlay={handlePlay}
                    onLike={handleLike}
                    onComment={handleComment}
                    onDelete={onDelete}
                  />
                </div>
              ))}
            </HorizontalSection>
          )}

          {topRated?.length > 0 && (
            <HorizontalSection title="Most Discussed">
              {topRated.map(track => (
                <div key={track.id} className="min-w-[260px] w-[260px] snap-start">
                  <TrackCard 
                    track={track} 
                    user={user}
                    onPlay={handlePlay}
                    onLike={handleLike}
                    onComment={handleComment}
                    onDelete={onDelete}
                  />
                </div>
              ))}
            </HorizontalSection>
          )}

          {suggestedUsers?.length > 0 && (
            <HorizontalSection title="Who to Follow">
              {suggestedUsers.map(suggestedUser => (
                <div key={suggestedUser.id} className="min-w-[200px] w-[200px] snap-start">
                  <UserCard 
                    user={suggestedUser} 
                    onFollow={handleFollow}
                    onUnfollow={handleUnfollow}
                    isFollowing={false} // Suggested users are by definition not followed
                  />
                </div>
              ))}
            </HorizontalSection>
          )}

          {featuredPlaylists?.length > 0 && (
            <HorizontalSection title="Featured Playlists">
              {featuredPlaylists.map(playlist => (
                <div key={playlist.id} className="min-w-[260px] w-[260px] snap-start">
                  <PlaylistCard 
                    playlist={playlist} 
                    onPlay={handlePlayPlaylist}
                  />
                </div>
              ))}
            </HorizontalSection>
          )}
        </>
      )}
    </div>
  );
};

export default HomeView;
