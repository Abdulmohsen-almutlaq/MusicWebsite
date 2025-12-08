# 6rabyat Music Backend Documentation

## 🗄️ Database Schema (SQLite)

The database is managed using **Prisma ORM**.

### `User`
| Field | Type | Description |
|-------|------|-------------|
| `id` | Int | Primary Key (Auto-increment) |
| `email` | String | Unique email address |
| `password` | String | Hashed password |
| `isVerified` | Boolean | Email verification status |
| `verificationToken` | String? | Token for email verification |
| `createdAt` | DateTime | Timestamp of registration |
| `playlists` | Relation | One-to-Many with Playlist |
| `tracks` | Relation | One-to-Many with Track (Uploads) |
| `followedBy` | Relation | Users who follow this user |
| `following` | Relation | Users this user follows |
| `likes` | Relation | Tracks liked by user |
| `comments` | Relation | Comments made by user |

### `Track`
| Field | Type | Description |
|-------|------|-------------|
| `id` | Int | Primary Key (Auto-increment) |
| `title` | String | Song title |
| `artist` | String | Artist name |
| `duration` | Int? | Duration in seconds |
| `filePath` | String | Path to audio file on disk |
| `coverPath` | String? | Path to cover image on disk |
| `uploadedAt` | DateTime | Timestamp of upload |
| `isPublic` | Boolean | Visibility (Default: true) |
| `playCount` | Int | Number of plays (Default: 0) |
| `userId` | Int? | Uploader ID |
| `playlists` | Relation | Many-to-Many with Playlist |
| `likes` | Relation | Users who liked this track |
| `comments` | Relation | Comments on this track |

### `Playlist`
| Field | Type | Description |
|-------|------|-------------|
| `id` | Int | Primary Key (Auto-increment) |
| `name` | String | Playlist name |
| `description` | String? | Optional description |
| `isPublic` | Boolean | Visibility (Default: true) |
| `userId` | Int | Owner ID |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |
| `tracks` | Relation | Many-to-Many with Track |

### `Like`
| Field | Type | Description |
|-------|------|-------------|
| `userId` | Int | User who liked |
| `trackId` | Int | Track liked |
| `createdAt` | DateTime | Timestamp |

### `Comment`
| Field | Type | Description |
|-------|------|-------------|
| `id` | Int | Primary Key |
| `content` | String | Comment text (Max 60 chars) |
| `userId` | Int | Author |
| `trackId` | Int | Track |
| `createdAt` | DateTime | Timestamp |

---

## 🔌 API Endpoints

**Base URL:** `http://localhost:3000/api`

### 🔐 Global Security
All endpoints (except `GET /api/auth/verify`) require the **Site Password** header:
- **Header:** `x-site-password: arab99` (or value from `.env`)

### 👤 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/register` | Register a new user | ❌ |
| `POST` | `/login` | Login user (Returns JWT) | ❌ |
| `GET` | `/verify` | Verify email (via link) | ❌ |

### 🎵 Tracks (`/api/tracks`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/public` | Get all public tracks (Global Feed) | ❌ |
| `GET` | `/user/:userId` | Get a specific user's public tracks | ❌ |
| `GET` | `/stream/:trackId` | Stream audio file | ❌ |
| `POST` | `/` | Upload a new track (Form-data: `track`, `cover`) | ✅ |
| `PATCH` | `/:id/visibility` | Toggle Public/Private status | ✅ (Owner) |
| `GET` | `/` | Get all tracks (Admin/Debug) | ❌ |

### 📜 Playlists (`/api/playlists`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/user/:userId` | Get a specific user's public playlists | ❌ |
| `POST` | `/` | Create a new playlist | ✅ |
| `GET` | `/` | Get **MY** playlists | ✅ |
| `GET` | `/:id` | Get playlist details & tracks | ✅ |
| `PATCH` | `/:id/visibility` | Toggle Public/Private status | ✅ (Owner) |
| `POST` | `/:id/tracks` | Add track to playlist | ✅ (Owner) |
| `DELETE` | `/:id/tracks/:trackId` | Remove track from playlist | ✅ (Owner) |
| `DELETE` | `/:id` | Delete playlist | ✅ (Owner) |

### 👥 Users & Social (`/api/users`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/search` | Search users by email | ❌ |
| `GET` | `/:id` | Get User Profile (Stats, Recent Tracks) | ❌ |
| `POST` | `/:id/follow` | Follow a user | ✅ |
| `POST` | `/:id/unfollow` | Unfollow a user | ✅ |

### 🏠 Activity Feed & Engagement (`/api/feed`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/` | **Smart Feed** (Following + Trending) | ✅ |
| `POST` | `/tracks/:id/like` | Like a track | ✅ |
| `DELETE` | `/tracks/:id/like` | Unlike a track | ✅ |
| `POST` | `/tracks/:id/comments` | Add comment (Max 60 chars) | ✅ |
| `GET` | `/tracks/:id/comments` | Get comments for a track | ✅ |
| `POST` | `/tracks/:id/play` | Increment play count | ✅ |
