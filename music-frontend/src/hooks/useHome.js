import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import api from '../utils/api';
import { io } from 'socket.io-client';

export const useHome = () => {
  const { sitePassword, saveSitePassword, user, logout } = useAuth();
  const { playTrack } = usePlayer();
  const [view, setView] = useState('home'); // home, search, library, upload
  
  // Optimization Refs
  const refreshTimeoutRef = useRef(null);
  const lastLibraryFetchRef = useRef(0);

  // Data States
  const [feed, setFeed] = useState([]); // New Releases (default feed)
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [featuredPlaylists, setFeaturedPlaylists] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [socketMessage, setSocketMessage] = useState('');
  
  // Library State
  const [libraryPlaylists, setLibraryPlaylists] = useState([]);
  const [likedPlaylists, setLikedPlaylists] = useState([]);
  const [libraryUploads, setLibraryUploads] = useState([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);

  // Upload State
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadCover, setUploadCover] = useState(null);
  const [uploadGenre, setUploadGenre] = useState('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadArtist, setUploadArtist] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Social State
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [loadingSocial, setLoadingSocial] = useState(false);

  const genres = ['Pop', 'Rock', 'Hip Hop', 'R&B', 'Country', 'Jazz', 'Classical', 'Electronic', 'Reggae', 'Blues', 'Folk', 'Soul', 'Other'];

  // Optimized Fetching Functions
  const fetchDiscovery = useCallback(async () => {
    try {
      const [suggestedRes, featuredRes] = await Promise.allSettled([
        api.get('/users/suggested'),
        api.get('/playlists/featured')
      ]);
      
      if (suggestedRes.status === 'fulfilled') setSuggestedUsers(suggestedRes.value.data);
      if (featuredRes.status === 'fulfilled') setFeaturedPlaylists(featuredRes.value.data);
    } catch (e) { console.error("Discovery fetch error", e); }
  }, []);

  const fetchFeed = useCallback(async (showLoading = true) => {
    if (showLoading) setLoadingFeed(true);
    try {
      const [feedRes, trendingRes, topRatedRes] = await Promise.allSettled([
        api.get('/feed?limit=20'),
        api.get('/tracks/trending'),
        api.get('/tracks/top-rated')
      ]);

      if (feedRes.status === 'fulfilled') setFeed(feedRes.value.data);
      if (trendingRes.status === 'fulfilled') setTrending(trendingRes.value.data);
      if (topRatedRes.status === 'fulfilled') setTopRated(topRatedRes.value.data);
    } catch (e) { 
      console.error(e);
      if (e.response?.status === 401) logout();
    } finally {
      if (showLoading) setLoadingFeed(false);
    }
  }, [logout]);

  const fetchLibrary = useCallback(async () => {
    setLoadingLibrary(true);
    try {
      const [playlistsRes, likedPlaylistsRes, myTracksRes] = await Promise.allSettled([
        api.get('/playlists'),
        api.get('/playlists/liked'),
        api.get('/tracks/me')
      ]);
      
      if (playlistsRes.status === 'fulfilled') setLibraryPlaylists(playlistsRes.value.data);
      if (likedPlaylistsRes.status === 'fulfilled') setLikedPlaylists(likedPlaylistsRes.value.data);
      if (myTracksRes.status === 'fulfilled') setLibraryUploads(myTracksRes.value.data);
      
      lastLibraryFetchRef.current = Date.now();
    } catch (e) { console.error(e); } finally {
      setLoadingLibrary(false);
    }
  }, []);

  const performSearch = useCallback(async () => {
    if (!searchQuery) return;
    try {
      const res = await api.get(`/tracks/search?query=${searchQuery}`);
      setSearchResults(res.data); 
    } catch (e) { console.error(e); }
  }, [searchQuery]);

  // Initial Load & Socket Setup
  useEffect(() => {
    if (user) {
      const initLoad = async () => {
        setLoadingFeed(true);
        await Promise.all([fetchFeed(false), fetchDiscovery(), fetchLibrary()]);
        setLoadingFeed(false);
      };
      initLoad();

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const socketUrl = apiUrl.includes('/api') ? apiUrl.replace('/api', '') : apiUrl;
      const socket = io(socketUrl);
      
      socket.on('new_track', (data) => {
        setSocketMessage(`New Release: ${data.track.title}`);
        setTimeout(() => setSocketMessage(''), 5000);
        
        // Optimistic Update: Add to feed
        setFeed(prev => [data.track, ...prev]);
      });

      socket.on('like_update', ({ trackId, count }) => {
        const updateTrack = (track) => {
            if (track.id === trackId) {
                return { ...track, _count: { ...track._count, likes: count } };
            }
            return track;
        };
        setFeed(prev => prev.map(updateTrack));
        setTrending(prev => prev.map(updateTrack));
        setTopRated(prev => prev.map(updateTrack));
        // Also update library if needed, but maybe less critical to do instantly
        // fetchLibrary(); 
      });

      socket.on('new_comment', ({ trackId, comment }) => {
         const updateTrack = (track) => {
            if (track.id === trackId) {
                return { 
                    ...track, 
                    _count: { ...track._count, comments: (track._count?.comments || 0) + 1 },
                    comments: [comment, ...(track.comments || [])].slice(0, 5)
                };
            }
            return track;
        };
        setFeed(prev => prev.map(updateTrack));
        setTrending(prev => prev.map(updateTrack));
        setTopRated(prev => prev.map(updateTrack));
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user, fetchFeed, fetchDiscovery, fetchLibrary]);

  // Refetch library when entering library view
  useEffect(() => {
    if (view === 'library') {
      const now = Date.now();
      if (now - lastLibraryFetchRef.current > 60000) {
        fetchLibrary();
      }
    }
  }, [view, fetchLibrary]);

  // Debounced Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, performSearch]);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return alert("Please select a file");
    setIsUploading(true);

    const formData = new FormData();
    formData.append('title', uploadTitle || 'Untitled');
    formData.append('artist', uploadArtist || 'Unknown Artist');
    formData.append('genre', uploadGenre);
    formData.append('track', uploadFile);
    if (uploadCover) formData.append('cover', uploadCover);

    try {
      await api.post('/tracks', formData);
      alert('Upload Successful!');
      setView('home');
      fetchFeed();
      // Reset form
      setUploadFile(null);
      setUploadCover(null);
      setUploadTitle('');
      setUploadArtist('');
    } catch (e) { alert(e.message); } finally {
      setIsUploading(false);
    }
  };

  // Optimistic Like Handler
  const handleLike = useCallback(async (id) => {
    const track = feed.find(t => t.id === id) || trending.find(t => t.id === id) || topRated.find(t => t.id === id) || searchResults.find(t => t.id === id);
    if (!track) return;

    const isLiked = track.likes?.some(like => like.userId == user?.id);
    
    // Optimistic Update Helper
    const updateTrackList = (list) => list.map(t => {
      if (t.id === id) {
        const newLikes = isLiked 
          ? (t.likes || []).filter(l => l.userId != user.id)
          : [...(t.likes || []), { userId: user.id }];
        return { ...t, likes: newLikes, _count: { ...t._count, likes: newLikes.length } };
      }
      return t;
    });

    // Apply Optimistic Updates
    setFeed(prev => updateTrackList(prev));
    setTrending(prev => updateTrackList(prev));
    setTopRated(prev => updateTrackList(prev));
    setSearchResults(prev => updateTrackList(prev));

    try {
      if (isLiked) {
        await api.delete(`/feed/tracks/${id}/like`);
      } else {
        await api.post(`/feed/tracks/${id}/like`);
      }
    } catch (e) { 
      console.error(e);
      // Revert on error by refetching
      fetchFeed(false);
    }
  }, [feed, trending, topRated, searchResults, user, fetchFeed]);

  const handleComment = async (id, content) => {
    if (!content) return;
    try {
      await api.post(`/feed/tracks/${id}/comments`, { content });
      fetchFeed(false);
    } catch (e) { console.error(e); }
  };

  const handlePlay = useCallback((track) => {
    playTrack(track, feed);
  }, [playTrack, feed]);

  const handlePlayPlaylist = useCallback(async (playlist) => {
    try {
      // Fetch full playlist to get all tracks
      const { data } = await api.get(`/playlists/${playlist.id}`);
      if (!data.tracks || data.tracks.length === 0) return;
      
      const tracks = data.tracks.map(t => t.track || t);
      playTrack(tracks[0], tracks);
    } catch (e) {
      console.error("Failed to play playlist", e);
      // Fallback to existing tracks if fetch fails
      if (playlist.tracks && playlist.tracks.length > 0) {
        const tracks = playlist.tracks.map(t => t.track || t);
        playTrack(tracks[0], tracks);
      }
    }
  }, [playTrack]);

  const handleDeletePlaylist = async (playlistId) => {
    try {
      await api.delete(`/playlists/${playlistId}`);
      fetchLibrary();
    } catch (e) {
      console.error("Failed to delete playlist", e);
      alert("Failed to delete playlist");
    }
  };

  const handleDeleteTrack = async (trackId) => {
    if (!window.confirm("Are you sure you want to delete this track?")) return;
    try {
      await api.delete(`/tracks/${trackId}`);
      fetchFeed();
      fetchLibrary();
      setSearchResults(prev => prev.filter(t => t.id !== trackId));
    } catch (e) {
      console.error("Failed to delete track", e);
      alert("Failed to delete track");
    }
  };

  const handleChangePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      alert('Password changed successfully');
      return true;
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.error || e.response?.data?.message || 'Failed to change password');
      return false;
    }
  };

  const handleUpdateProfile = async (username, isPrivate) => {
    try {
      const res = await api.put('/auth/profile', { username, isPrivate });
      alert('Profile updated successfully');
      return res.data;
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.error || e.response?.data?.message || 'Failed to update profile');
      return null;
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    
    try {
      await api.delete('/auth/account');
      logout();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.error || e.response?.data?.message || 'Failed to delete account');
    }
  };

  const fetchFollowers = useCallback(async (userId) => {
    setLoadingSocial(true);
    try {
      const res = await api.get(`/users/${userId}/followers`);
      setFollowersList(res.data);
    } catch (e) { console.error(e); } finally { setLoadingSocial(false); }
  }, []);

  const fetchFollowing = useCallback(async (userId) => {
    setLoadingSocial(true);
    try {
      const res = await api.get(`/users/${userId}/following`);
      setFollowingList(res.data);
    } catch (e) { console.error(e); } finally { setLoadingSocial(false); }
  }, []);

  const handleFollow = async (userId) => {
    try {
      await api.post(`/users/${userId}/follow`);
      fetchFollowing(user.id);
      if (view === 'followers') fetchFollowers(user.id);
      fetchFeed(false);
    } catch (e) { 
      console.error(e); 
      alert(e.response?.data?.message || "Failed to follow user");
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await api.post(`/users/${userId}/unfollow`);
      fetchFollowing(user.id);
      if (view === 'followers') fetchFollowers(user.id);
      fetchFeed(false);
    } catch (e) { 
      console.error(e);
      alert(e.response?.data?.message || "Failed to unfollow user");
    }
  };

  const handleLikePlaylist = async (playlistId) => {
    try {
      await api.post(`/playlists/${playlistId}/like`);
    } catch (error) {
      console.error("Error liking playlist:", error);
    }
  };

  return {
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
    handleChangePassword,
    handleUpdateProfile,
    handleDeleteAccount,
    libraryPlaylists,
    likedPlaylists,
    libraryUploads,
    loadingLibrary,
    fetchLibrary,
    // Social Exports
    followersList,
    followingList,
    loadingSocial,
    fetchFollowers,
    fetchFollowing,
    handleFollow,
    handleUnfollow
  };
};
