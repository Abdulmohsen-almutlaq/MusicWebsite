const prisma = require('../config/db');
const fs = require('fs');
const path = require('path');

exports.createPlaylist = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.userData.userId;

    const playlist = await prisma.playlist.create({
      data: {
        name,
        description,
        userId,
      },
    });

    res.status(201).json(playlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserPlaylists = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const playlists = await prisma.playlist.findMany({
      where: { userId },
      include: { 
        tracks: true,
        _count: { select: { tracks: true } } 
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(playlists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getLikedPlaylists = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const likedPlaylists = await prisma.playlistLike.findMany({
      where: { userId },
      include: {
        playlist: {
          include: {
            user: { select: { username: true } },
            tracks: { take: 4 }, // Include a few tracks for covers
            _count: { select: { tracks: true, likes: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Flatten the structure to return just the playlists with added info
    const playlists = likedPlaylists.map(like => ({
      ...like.playlist,
      likedAt: like.createdAt,
      likeCount: like.playlist._count.likes,
      trackCount: like.playlist._count.tracks,
      creatorName: like.playlist.user.username,
      isLiked: true // Since we are fetching liked playlists
    }));

    res.status(200).json(playlists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Featured/Random Public Playlists
exports.getFeaturedPlaylists = async (req, res) => {
  try {
    const userId = req.userData ? req.userData.userId : -1;
    
    // Get total count of public playlists
    const count = await prisma.playlist.count({ where: { isPublic: true } });
    
    // Calculate random skip
    const skip = Math.max(0, Math.floor(Math.random() * count) - 5);

    const playlists = await prisma.playlist.findMany({
      where: { isPublic: true },
      include: {
        user: { select: { username: true } },
        tracks: { take: 4 }, // For covers
        _count: { select: { tracks: true, likes: true } },
        likes: { where: { userId }, select: { userId: true } }
      },
      take: 5,
      skip: skip,
      orderBy: { likes: { _count: 'desc' } } // Mix of random skip + popularity
    });

    const formatted = playlists.map(p => ({
      ...p,
      creatorName: p.user.username,
      trackCount: p._count.tracks,
      likeCount: p._count.likes,
      isLiked: p.likes.length > 0
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPlaylistById = async (req, res) => {
  try {
    const { id } = req.params;
    const playlist = await prisma.playlist.findUnique({
      where: { id: parseInt(id) },
      include: { tracks: true }
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    res.status(200).json(playlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle Playlist Visibility
exports.toggleVisibility = async (req, res) => {
  try {
    const playlistId = parseInt(req.params.id);
    const userId = req.userData.userId;

    const playlist = await prisma.playlist.findUnique({ where: { id: playlistId } });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    if (playlist.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedPlaylist = await prisma.playlist.update({
      where: { id: playlistId },
      data: { isPublic: !playlist.isPublic }
    });

    res.json(updatedPlaylist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get User's Public Playlists
exports.getPublicUserPlaylists = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const playlists = await prisma.playlist.findMany({
      where: { 
        userId: userId,
        isPublic: true 
      },
      include: { 
        _count: { select: { tracks: true, likes: true } },
        likes: { where: { userId: req.userData ? req.userData.userId : -1 }, select: { userId: true } }
      }
    });
    
    // Transform to add 'isLiked' boolean
    const playlistsWithLikeState = playlists.map(p => ({
        ...p,
        isLiked: p.likes.length > 0
    }));

    res.json(playlistsWithLikeState);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle Like Playlist
exports.toggleLike = async (req, res) => {
  try {
    const playlistId = parseInt(req.params.id);
    const userId = req.userData.userId;

    const existingLike = await prisma.playlistLike.findUnique({
      where: {
        userId_playlistId: {
          userId: userId,
          playlistId: playlistId
        }
      }
    });

    if (existingLike) {
      await prisma.playlistLike.delete({
        where: { id: existingLike.id }
      });
      res.json({ message: 'Unliked', liked: false });
    } else {
      await prisma.playlistLike.create({
        data: {
          userId: userId,
          playlistId: playlistId
        }
      });
      res.json({ message: 'Liked', liked: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addTrackToPlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const { trackId } = req.body;
    const userId = req.userData.userId;

    // Verify ownership
    const playlist = await prisma.playlist.findUnique({ where: { id: parseInt(id) } });
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    if (playlist.userId !== userId) return res.status(403).json({ message: 'Not authorized' });

    const updatedPlaylist = await prisma.playlist.update({
      where: { id: parseInt(id) },
      data: {
        tracks: {
          connect: { id: parseInt(trackId) }
        }
      },
      include: { tracks: true }
    });

    res.status(200).json(updatedPlaylist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.removeTrackFromPlaylist = async (req, res) => {
  try {
    const { id, trackId } = req.params;
    const userId = req.userData.userId;

    // Verify ownership
    const playlist = await prisma.playlist.findUnique({ where: { id: parseInt(id) } });
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    if (playlist.userId !== userId) return res.status(403).json({ message: 'Not authorized' });

    const updatedPlaylist = await prisma.playlist.update({
      where: { id: parseInt(id) },
      data: {
        tracks: {
          disconnect: { id: parseInt(trackId) }
        }
      },
      include: { tracks: true }
    });

    res.status(200).json(updatedPlaylist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deletePlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userData.userId;

    const playlist = await prisma.playlist.findUnique({ 
      where: { id: parseInt(id) },
      include: { tracks: true }
    });
    
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    if (playlist.userId !== userId) return res.status(403).json({ message: 'Not authorized' });

    // Delete all tracks owned by the user in this playlist
    const musicDir = path.join(__dirname, '../../data/music');
    const coverDir = path.join(__dirname, '../../data/covers');

    for (const track of playlist.tracks) {
      // Only delete tracks that belong to the user deleting the playlist
      if (track.userId === userId) {
        // Delete files
        const trackPath = path.join(musicDir, track.filePath);
        if (fs.existsSync(trackPath)) {
          try {
            fs.unlinkSync(trackPath);
          } catch (err) {
            console.error(`Failed to delete track file for ${track.id}:`, err);
          }
        }

        if (track.coverPath && track.coverPath !== 'default-cover.png') {
          const coverPath = path.join(coverDir, track.coverPath);
          if (fs.existsSync(coverPath)) {
            try {
              fs.unlinkSync(coverPath);
            } catch (err) {
              console.error(`Failed to delete cover file for ${track.id}:`, err);
            }
          }
        }

        // Delete Track from DB
        try {
          await prisma.track.delete({ where: { id: track.id } });
        } catch (err) {
          console.error(`Failed to delete track DB record for ${track.id}:`, err);
        }
      }
    }

    // Finally, delete the playlist itself
    await prisma.playlist.delete({ where: { id: parseInt(id) } });

    res.status(200).json({ message: 'Playlist and its tracks deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
