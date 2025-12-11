const prisma = require('../config/db');

// Follow a user
exports.followUser = async (req, res) => {
  try {
    const followerId = req.userData.userId; // From auth middleware
    const followingId = parseInt(req.params.id);

    if (followerId === followingId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    await prisma.user.update({
      where: { id: followerId },
      data: {
        following: {
          connect: { id: followingId }
        }
      }
    });

    res.json({ message: "Followed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error following user" });
  }
};

// Unfollow a user
exports.unfollowUser = async (req, res) => {
  try {
    const followerId = req.userData.userId;
    const followingId = parseInt(req.params.id);

    await prisma.user.update({
      where: { id: followerId },
      data: {
        following: {
          disconnect: { id: followingId }
        }
      }
    });

    res.json({ message: "Unfollowed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error unfollowing user" });
  }
};

// Get Suggested Users (Who to Follow)
exports.getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.userData.userId;

    // Get IDs of users already followed
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { following: { select: { id: true } } }
    });

    const followingIds = currentUser.following.map(u => u.id);
    followingIds.push(userId); // Exclude self

    // Find users NOT in the following list
    const suggestions = await prisma.user.findMany({
      where: {
        id: { notIn: followingIds }
      },
      select: {
        id: true,
        username: true,
        email: true,
        _count: {
          select: { followedBy: true, tracks: true }
        },
        tracks: {
          take: 1,
          orderBy: { playCount: 'desc' },
          select: {
            id: true,
            title: true,
            artist: true,
            coverPath: true,
            filePath: true,
            duration: true
          }
        },
        playlists: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            description: true,
            tracks: {
              take: 5,
              select: {
                id: true,
                title: true,
                artist: true,
                coverPath: true,
                filePath: true,
                duration: true
              }
            }
          }
        }
      },
      orderBy: {
        followedBy: { _count: 'desc' } // Suggest popular users first
      },
      take: 5
    });

    res.json(suggestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching suggestions" });
  }
};

// Get User Profile (with stats and public content)
exports.getProfile = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const currentUserId = req.userData ? req.userData.userId : null;
    
    // Prepare the include object for playlists
    const playlistInclude = {
      _count: { select: { likes: true } }
    };

    // Only check for 'liked by current user' if there is a current user
    if (currentUserId) {
      playlistInclude.likes = { 
        where: { userId: currentUserId }, 
        select: { userId: true } 
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        isPrivate: true,
        createdAt: true,
        role: true, // Include role
        _count: {
          select: {
            followedBy: true, 
            following: true,
            tracks: true,
            playlists: true
          }
        },
        // Get public tracks
        tracks: {
          where: { isPublic: true },
          take: 5,
          orderBy: { uploadedAt: 'desc' }
        },
        // Get public playlists
        playlists: {
          where: { isPublic: true },
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: playlistInclude
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Map 'followedBy' count to 'followers' for clarity if needed, 
    // but Prisma _count uses the relation name. 
    // In schema: followedBy User[] @relation("UserFollows")
    // So _count.followedBy is the follower count.
    
    // Let's refine the response structure
    const isOwner = currentUserId === userId;

    const profile = {
      id: user.id,
      username: user.username,
      isPrivate: user.isPrivate,
      // email: user.email, // Hide email for privacy
      joinedAt: user.createdAt,
      stats: {
        followers: user._count.followedBy,
        following: user._count.following,
        tracks: user._count.tracks,
        playlists: user._count.playlists
      },
      recentTracks: user.tracks,
      recentPlaylists: user.playlists.map(p => ({
        ...p,
        likeCount: p._count.likes,
        isLiked: p.likes.length > 0
      }))
    };

    if (isOwner) {
      profile.email = user.email;
      profile.role = user.role;
    }

    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching profile" });
  }
};

// Get All Users (Social Feed with Pagination)
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await prisma.user.findMany({
      skip: skip,
      take: limit,
      select: {
        id: true,
        username: true,
        email: true,
        _count: {
          select: {
            followedBy: true,
            tracks: true
          }
        },
        tracks: {
          where: { isPublic: true },
          take: 3,
          orderBy: { uploadedAt: 'desc' },
          select: {
            id: true,
            title: true,
            coverPath: true,
            artist: true
          }
        },
        playlists: {
            where: { isPublic: true },
            take: 3,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true
            }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

// Search Users
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query } },
          { email: { contains: query } }
        ]
      },
      select: {
        id: true,
        username: true,
        email: true,
        _count: {
          select: { followedBy: true }
        }
      },
      take: 10
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error searching users" });
  }
};

// Get Followers List
exports.getFollowers = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        followedBy: {
          select: {
            id: true,
            username: true,
            email: true,
            _count: { select: { followedBy: true } }
          }
        }
      }
    });
    
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.followedBy);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching followers" });
  }
};

// Get Following List
exports.getFollowing = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        following: {
          select: {
            id: true,
            username: true,
            email: true,
            _count: { select: { followedBy: true } }
          }
        }
      }
    });

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.following);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching following" });
  }
};

// Request Upload Access
exports.requestUploadAccess = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const { reason } = req.body;

    // Check if already has access
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user.role === 'uploader' || user.role === 'admin') {
      return res.status(400).json({ message: "You already have upload access." });
    }

    // Check for existing pending request
    const existingRequest = await prisma.accessRequest.findFirst({
      where: { userId, status: 'pending' }
    });

    if (existingRequest) {
      return res.status(400).json({ message: "You already have a pending request." });
    }

    await prisma.accessRequest.create({
      data: {
        userId,
        reason,
        status: 'pending'
      }
    });

    res.json({ message: "Request submitted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error submitting request" });
  }
};

// Get Access Request Status
exports.getAccessRequestStatus = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const request = await prisma.accessRequest.findFirst({
      where: { userId, status: 'pending' }
    });
    res.json({ hasPendingRequest: !!request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching request status" });
  }
};

// Admin: Approve Access (Simplified for now, usually would be in adminController)
exports.approveAccessRequest = async (req, res) => {
  try {
    // In a real app, check if req.userData.role === 'admin'
    const { requestId } = req.body;
    
    const request = await prisma.accessRequest.findUnique({ where: { id: requestId } });
    if (!request) return res.status(404).json({ message: "Request not found" });

    // Update User Role
    await prisma.user.update({
      where: { id: request.userId },
      data: { role: 'uploader' }
    });

    // Update Request Status
    await prisma.accessRequest.update({
      where: { id: requestId },
      data: { status: 'approved' }
    });

    res.json({ message: "Access granted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error approving request" });
  }
};

// Admin: Get All Pending Requests
exports.getAllPendingRequests = async (req, res) => {
  try {
    console.log("[getAllPendingRequests] Fetching pending requests...");
    
    const requests = await prisma.accessRequest.findMany({
      where: { status: 'pending' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`[getAllPendingRequests] Found ${requests.length} requests.`);
    res.json(requests);
  } catch (error) {
    console.error("[getAllPendingRequests] Error:", error);
    res.status(500).json({ message: "Error fetching requests" });
  }
};
