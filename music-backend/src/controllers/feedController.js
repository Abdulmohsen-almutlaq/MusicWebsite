const prisma = require('../config/db');
const io = require('../socket');

// Get Activity Feed
exports.getFeed = async (req, res) => {
  try {
    const userId = req.userData.userId;
    console.log(`[getFeed] Fetching feed for User ID: ${userId}`);

    // 1. Get IDs of users I follow
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        following: {
          select: { id: true }
        }
      }
    });

    const followingIds = user.following.map(u => u.id);

    // 2. Fetch tracks from followed users (The "Personal" Feed)
    let feedTracks = await prisma.track.findMany({
      where: {
        userId: { in: followingIds },
        isPublic: true
      },
      include: {
        user: { select: { id: true, email: true } },
        _count: { select: { likes: true, comments: true } },
        likes: { where: { userId: userId }, select: { userId: true } },
        comments: {
          include: { user: { select: { email: true, username: true } } },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { uploadedAt: 'desc' },
      take: 20
    });

    // 3. If feed is sparse (e.g., < 10 tracks), fill with "Trending/Discovery"
    if (feedTracks.length < 10) {
      console.log('[getFeed] Feed sparse, fetching discovery tracks...');
      const excludeIds = feedTracks.map(t => t.id);
      
      const discoveryTracks = await prisma.track.findMany({
        where: {
          isPublic: true,
          id: { notIn: excludeIds }
        },
        include: {
          user: { select: { id: true, email: true } },
          _count: { select: { likes: true, comments: true } },
          likes: { where: { userId: userId }, select: { userId: true } },
          comments: {
            include: { user: { select: { email: true, username: true } } },
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        },
        orderBy: [
          { playCount: 'desc' }, // Most played first
          { uploadedAt: 'desc' }
        ],
        take: 10 - feedTracks.length // Fill the gap
      });

      feedTracks = [...feedTracks, ...discoveryTracks];
    }

    res.json(feedTracks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching feed' });
  }
};

// Like a Track
exports.likeTrack = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const trackId = parseInt(req.params.id);

    await prisma.like.create({
      data: { userId, trackId }
    });

    const count = await prisma.like.count({ where: { trackId } });
    io.getIO().emit('like_update', { trackId, count });

    res.json({ message: 'Track liked' });
  } catch (error) {
    // Unique constraint violation means already liked
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Already liked' });
    }
    res.status(500).json({ message: 'Error liking track' });
  }
};

// Unlike a Track
exports.unlikeTrack = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const trackId = parseInt(req.params.id);

    await prisma.like.deleteMany({
      where: { userId, trackId }
    });

    const count = await prisma.like.count({ where: { trackId } });
    io.getIO().emit('like_update', { trackId, count });

    res.json({ message: 'Track unliked' });
  } catch (error) {
    res.status(500).json({ message: 'Error unliking track' });
  }
};

// Add Comment
exports.addComment = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const trackId = parseInt(req.params.id);
    const { content } = req.body;

    if (!content) return res.status(400).json({ message: 'Content required' });
    if (content.length > 60) {
      return res.status(400).json({ message: 'Comment exceeds 60 characters limit' });
    }

    const comment = await prisma.comment.create({
      data: { userId, trackId, content },
      include: { user: { select: { id: true, email: true } } }
    });

    io.getIO().emit('new_comment', { trackId, comment });

    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment' });
  }
};

// Get Comments
exports.getComments = async (req, res) => {
  try {
    const trackId = parseInt(req.params.id);
    const comments = await prisma.comment.findMany({
      where: { trackId },
      include: { user: { select: { id: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments' });
  }
};

// Increment Play Count
exports.playTrack = async (req, res) => {
  try {
    const trackId = parseInt(req.params.id);
    await prisma.track.update({
      where: { id: trackId },
      data: { playCount: { increment: 1 } }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error updating play count' });
  }
};
