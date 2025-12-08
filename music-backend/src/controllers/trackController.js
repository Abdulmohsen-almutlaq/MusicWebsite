const prisma = require('../config/db');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const ffmpeg = require('fluent-ffmpeg');
const io = require('../socket');
const { optimizeCoverImage } = require('../utils/fileProcessor');

exports.uploadTrack = async (req, res) => {
  try {
    const { title, artist, duration, genre } = req.body;
    
    // Safely access req.files
    const files = req.files || {};
    const trackFile = files['track'] ? files['track'][0] : null;
    const coverFile = files['cover'] ? files['cover'][0] : null;

    if (!trackFile) {
      return res.status(400).json({ message: 'Track file is required' });
    }

    let trackDuration = duration ? parseInt(duration) : null;

    // If duration is missing, try to extract it using ffmpeg
    if (!trackDuration) {
      try {
        const getDuration = () => new Promise((resolve, reject) => {
          ffmpeg.ffprobe(trackFile.path, (err, metadata) => {
            if (err) return reject(err);
            resolve(metadata.format.duration);
          });
        });
        trackDuration = Math.round(await getDuration());
      } catch (e) {
        console.error("Failed to extract duration:", e);
      }
    }

    // Optimize Cover Image (Clean Code: Logic extracted to utility)
    let finalCoverPath = 'default-cover.png';
    if (coverFile) {
      finalCoverPath = await optimizeCoverImage(coverFile.path);
    }

    const track = await prisma.track.create({
      data: {
        title,
        artist,
        duration: trackDuration,
        genre: genre || null,
        filePath: trackFile.filename,
        coverPath: finalCoverPath,
        userId: req.userData ? req.userData.userId : null, // Link to user if authenticated
      },
    });

    // Notify all clients about the new track
    io.getIO().emit('new_track', { message: 'A new track has been uploaded!', track });

    res.status(201).json(track);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle Track Visibility
exports.toggleVisibility = async (req, res) => {
  try {
    const trackId = parseInt(req.params.id);
    const userId = req.userData.userId;

    const track = await prisma.track.findUnique({ where: { id: trackId } });

    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }

    if (track.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedTrack = await prisma.track.update({
      where: { id: trackId },
      data: { isPublic: !track.isPublic }
    });

    res.json(updatedTrack);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Public Tracks (Feed) - Optimized with Pagination
exports.getPublicTracks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const tracks = await prisma.track.findMany({
      where: { isPublic: true },
      include: {
        user: {
          select: { id: true, username: true }
        },
        _count: { select: { likes: true, comments: true } },
        likes: { select: { userId: true } },
        comments: {
          include: { user: { select: { username: true } } },
          orderBy: { createdAt: 'desc' },
          take: 3
        }
      },
      orderBy: { uploadedAt: 'desc' },
      skip: skip,
      take: limit
    });
    res.json(tracks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTrendingTracks = async (req, res) => {
  try {
    const tracks = await prisma.track.findMany({
      where: { isPublic: true },
      include: {
        user: { select: { id: true, username: true } },
        _count: { select: { likes: true, comments: true } },
        likes: { select: { userId: true } }
      },
      orderBy: { likes: { _count: 'desc' } },
      take: 10
    });
    res.json(tracks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTopRatedTracks = async (req, res) => {
  try {
    const tracks = await prisma.track.findMany({
      where: { isPublic: true },
      include: {
        user: { select: { id: true, username: true } },
        _count: { select: { likes: true, comments: true } },
        likes: { select: { userId: true } }
      },
      orderBy: { comments: { _count: 'desc' } },
      take: 10
    });
    res.json(tracks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get User's Public Tracks
exports.getUserTracks = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const tracks = await prisma.track.findMany({
      where: { 
        userId: userId,
        isPublic: true 
      },
      include: {
        user: {
          select: { id: true, username: true }
        },
        _count: { select: { likes: true, comments: true } },
        likes: { select: { userId: true } },
        comments: {
          include: { user: { select: { username: true } } },
          orderBy: { createdAt: 'desc' },
          take: 3
        }
      },
      orderBy: { uploadedAt: 'desc' }
    });
    res.json(tracks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get My Tracks (All tracks uploaded by logged in user)
exports.getMyTracks = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const tracks = await prisma.track.findMany({
      where: { userId },
      include: {
        user: {
          select: { id: true, username: true }
        },
        _count: { select: { likes: true, comments: true } },
        likes: { select: { userId: true } },
        comments: {
          include: { user: { select: { username: true } } },
          orderBy: { createdAt: 'desc' },
          take: 3
        }
      },
      orderBy: { uploadedAt: 'desc' }
    });
    res.json(tracks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteTrack = async (req, res) => {
  try {
    const trackId = parseInt(req.params.id);
    const userId = req.userData.userId;

    const track = await prisma.track.findUnique({ where: { id: trackId } });

    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }

    if (track.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Define paths to data folders
    const musicDir = path.join(__dirname, '../../data/music');
    const coverDir = path.join(__dirname, '../../data/covers');
    
    // 1. Delete Music File
    if (track.filePath) {
      const trackPath = path.join(musicDir, track.filePath);
      if (fs.existsSync(trackPath)) {
        try {
          fs.unlinkSync(trackPath);
          console.log(`Deleted music file: ${trackPath}`);
        } catch (err) {
          console.error(`Failed to delete track file: ${trackPath}`, err);
        }
      } else {
        console.warn(`Music file not found at: ${trackPath}`);
      }
    }

    // 2. Delete Cover File (if not default)
    if (track.coverPath && track.coverPath !== 'default-cover.png') {
      const coverPath = path.join(coverDir, track.coverPath);
      if (fs.existsSync(coverPath)) {
        try {
          fs.unlinkSync(coverPath);
          console.log(`Deleted cover file: ${coverPath}`);
        } catch (err) {
          console.error(`Failed to delete cover file: ${coverPath}`, err);
        }
      }
    }

    // 3. Delete from Database
    await prisma.track.delete({ where: { id: trackId } });

    res.json({ message: 'Track deleted successfully' });
  } catch (error) {
    console.error("Error deleting track:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.streamTrack = async (req, res) => {
  try {
    const { trackId } = req.params;
    const track = await prisma.track.findUnique({ where: { id: parseInt(trackId) } });

    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }

    const filePath = path.join(__dirname, '../../data/music', track.filePath);
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found on server' });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;
    const contentType = mime.lookup(filePath) || 'audio/mpeg';

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      
      // Force small chunks to mimic streaming (SoundCloud-like behavior)
      // This prevents the browser from trying to download the whole file at once.
      const CHUNK_SIZE = 512 * 1024; // 512KB
      const requestedEnd = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      
      // Calculate end: min(start + chunk - 1, requested_end, file_end)
      const end = Math.min(start + CHUNK_SIZE - 1, requestedEnd, fileSize - 1);
      
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllTracks = async (req, res) => {
  try {
    const tracks = await prisma.track.findMany();
    res.status(200).json(tracks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.searchTracks = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: 'Query required' });

    const tracks = await prisma.track.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { artist: { contains: query } }
        ],
        isPublic: true
      },
      include: {
        user: { select: { id: true, email: true, username: true } },
        _count: { select: { likes: true, comments: true } },
        likes: true,
        comments: {
          include: { user: { select: { email: true, username: true } } },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });
    res.json(tracks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Search failed' });
  }
};
