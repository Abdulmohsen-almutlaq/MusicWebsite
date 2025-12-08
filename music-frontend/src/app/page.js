'use client';

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Music, Search as SearchIcon, Menu } from 'lucide-react';
import { useHome } from '../hooks/useHome';

// Views
import LandingPage from '../components/views/LandingPage';
import HomeView from '../components/views/HomeView';
import UploadView from '../components/views/UploadView';
import SearchView from '../components/views/SearchView';
import LibraryView from '../components/views/LibraryView';
import ProfileView from '../components/views/ProfileView';
import SettingsView from '../components/views/SettingsView';
import FollowersView from '../components/views/FollowersView';
import FollowingView from '../components/views/FollowingView';
import SocialView from '../components/views/SocialView';
import PublicProfileView from '../components/views/PublicProfileView';
import ArtistsView from '../components/views/ArtistsView';

export default function Home() {
  const [viewedProfileId, setViewedProfileId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const {
    user,
    sitePassword,
    saveSitePassword,
    logout,
    view,
    setView,
    feed,
    trending,
    topRated,
    suggestedUsers,
    featuredPlaylists,
    loadingFeed,
    searchResults,
    searchQuery,
    setSearchQuery,
    socketMessage,
    uploadFile,
    setUploadFile,
    uploadCover,
    setUploadCover,
    uploadGenre,
    setUploadGenre,
    uploadTitle,
    setUploadTitle,
    uploadArtist,
    setUploadArtist,
    isUploading,
    genres,
    handleSearch,
    handleUpload,
    handleLike,
    handleLikePlaylist,
    handleComment,
    handlePlay,
    handlePlayPlaylist,
    handleDeletePlaylist,
    handleDeleteTrack,
    libraryPlaylists,
    likedPlaylists,
    libraryUploads,
    loadingLibrary,
    handleChangePassword,
    handleUpdateProfile,
    handleDeleteAccount,
    followersList,
    followingList,
    loadingSocial,
    fetchFollowers,
    fetchFollowing,
    handleFollow,
    handleUnfollow
  } = useHome();

  // --- LANDING PAGE (No User) ---
  if (!user) {
    return <LandingPage sitePassword={sitePassword} saveSitePassword={saveSitePassword} />;
  }

  // --- MAIN APP LAYOUT ---
  return (
    <div className="flex h-full bg-brand-dark text-brand-beige font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        activeView={view} 
        setView={(v) => { setView(v); setIsSidebarOpen(false); }} 
        logout={logout} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative w-full">
        {/* Header */}
        <header className="h-16 bg-brand-dark/50 backdrop-blur-md border-b border-brand-light flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <button 
                className="md:hidden text-brand-light hover:text-brand-beige"
                onClick={() => setIsSidebarOpen(true)}
            >
                <Menu size={24} />
            </button>
            <div className="relative w-full">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-light" size={18} />
              <input 
                type="text" 
                placeholder="Search for artists, tracks..." 
                className="w-full bg-brand-medium border-none rounded-full py-2 pl-10 pr-4 text-sm text-brand-beige placeholder-brand-light/50 focus:ring-2 focus:ring-brand-beige/20 outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-4 ml-4">
            <div className="w-8 h-8 bg-brand-light rounded-full flex items-center justify-center text-xs font-bold text-brand-beige">
              {user.email[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-8 pb-32 custom-scrollbar">
          
          {/* Socket Notification */}
          {socketMessage && (
            <div className="fixed top-20 right-8 bg-brand-light text-brand-beige px-6 py-3 rounded-lg shadow-xl z-50 animate-bounce flex items-center gap-2">
              <Music size={20} />
              {socketMessage}
            </div>
          )}

          {/* VIEW: HOME */}
          {view === 'home' && (
            <HomeView 
              newReleases={feed}
              trending={trending}
              topRated={topRated}
              suggestedUsers={suggestedUsers}
              featuredPlaylists={featuredPlaylists}
              loading={loadingFeed}
              user={user} 
              handlePlay={handlePlay} 
              handlePlayPlaylist={handlePlayPlaylist}
              handleLike={handleLike} 
              handleComment={handleComment} 
              onDelete={handleDeleteTrack}
              handleFollow={handleFollow}
              handleUnfollow={handleUnfollow}
            />
          )}

          {/* VIEW: UPLOAD */}
          {view === 'upload' && (
            <UploadView 
              handleUpload={handleUpload}
              uploadTitle={uploadTitle} setUploadTitle={setUploadTitle}
              uploadArtist={uploadArtist} setUploadArtist={setUploadArtist}
              uploadGenre={uploadGenre} setUploadGenre={setUploadGenre}
              setUploadFile={setUploadFile} setUploadCover={setUploadCover}
              isUploading={isUploading} genres={genres}
            />
          )}

          {/* VIEW: SEARCH */}
          {view === 'search' && (
            <SearchView 
              searchQuery={searchQuery} 
              searchResults={searchResults} 
              user={user} 
              handlePlay={handlePlay} 
              handleLike={handleLike} 
              handleComment={handleComment} 
              onDelete={handleDeleteTrack}
            />
          )}

          {/* VIEW: LIBRARY */}
          {view === 'library' && (
            <LibraryView 
              loadingLibrary={loadingLibrary}
              libraryPlaylists={libraryPlaylists}
              likedPlaylists={likedPlaylists}
              libraryUploads={libraryUploads}
              handlePlayPlaylist={handlePlayPlaylist}
              handleDeletePlaylist={handleDeletePlaylist}
              handleDeleteTrack={handleDeleteTrack}
              user={user}
              handlePlay={handlePlay}
              handleLike={handleLike}
              handleComment={handleComment}
            />
          )}

          {/* VIEW: PROFILE */}
          {view === 'profile' && (
            <ProfileView 
              user={user} 
              libraryUploads={libraryUploads} 
              libraryPlaylists={libraryPlaylists} 
              setView={setView} 
              followersList={followersList}
              followingList={followingList}
              fetchFollowers={fetchFollowers}
              fetchFollowing={fetchFollowing}
              onDelete={handleDeleteTrack}
              onDeletePlaylist={handleDeletePlaylist}
            />
          )}

          {/* VIEW: SETTINGS */}
          {view === 'settings' && (
            <SettingsView 
              user={user} 
              handleUpdateProfile={handleUpdateProfile} 
              handleChangePassword={handleChangePassword} 
              handleDeleteAccount={handleDeleteAccount} 
            />
          )}

          {/* VIEW: FOLLOWERS */}
          {view === 'followers' && (
            <FollowersView 
              loadingSocial={loadingSocial}
              followersList={followersList}
              followingList={followingList}
              handleFollow={handleFollow}
              handleUnfollow={handleUnfollow}
              user={user}
              setView={setView}
            />
          )}

          {/* VIEW: FOLLOWING */}
          {view === 'following' && (
            <FollowingView 
              loadingSocial={loadingSocial}
              followingList={followingList}
              handleFollow={handleFollow}
              handleUnfollow={handleUnfollow}
              user={user}
              setView={setView}
            />
          )}

          {/* VIEW: SOCIAL */}
          {view === 'social' && (
            <SocialView 
              setView={setView} 
              setViewedProfileId={setViewedProfileId}
              user={user}
              followingList={followingList}
              handleFollow={handleFollow}
              handleUnfollow={handleUnfollow}
              fetchFollowing={fetchFollowing}
            />
          )}

          {/* VIEW: ARTISTS */}
          {view === 'artists' && (
            <ArtistsView 
              setView={setView}
              setViewedProfileId={setViewedProfileId}
              handlePlay={handlePlay}
              handleLike={handleLike}
            />
          )}

          {/* VIEW: PUBLIC PROFILE */}
          {view === 'public-profile' && (
            <PublicProfileView 
              viewedProfileId={viewedProfileId}
              setView={setView}
              handlePlay={handlePlay}
              handleLike={handleLike}
              handleLikePlaylist={handleLikePlaylist}
              handleComment={handleComment}
              user={user}
              followingList={followingList}
              handleFollow={handleFollow}
              handleUnfollow={handleUnfollow}
              fetchFollowing={fetchFollowing}
            />
          )}

        </main>
      </div>
    </div>
  );
}