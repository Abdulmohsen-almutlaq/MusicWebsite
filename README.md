# 6rabyat - Music Streaming Platform

6rabyat is a modern, full-stack music streaming application that combines audio streaming with social networking features. Built with Next.js, Node.js, and Docker, it offers a seamless experience for discovering, sharing, and listening to music.

## 🚀 Features

### 🎵 Music Streaming
- **Upload & Stream**: Users can upload their own tracks (MP3) with cover art.
- **Audio Player**: Persistent player with play/pause, seek, and volume controls.
- **Playlists**: Create, edit, and delete personal playlists.
- **Featured Content**: Discover "New Releases", "Trending Now", and "Top Rated" tracks.

### 🤝 Social Interaction
- **Follow System**: Follow other users to see their uploads in your feed.
- **Likes & Comments**: Interact with tracks through likes and real-time comments.
- **Who to Follow**: Smart suggestions for users to follow based on popularity.
- **Public Profiles**: View other users' uploads and public playlists.

### ⚡ Real-Time Updates
- **Live Notifications**: Get instant alerts for new releases, likes, and comments via Socket.io.
- **Optimistic UI**: Instant feedback for actions like liking a track.

### 🔒 Security & Access
- **Private Access**: Site-wide password protection for restricted access.
- **Authentication**: Secure Login and Registration system.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Context API + Hooks

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Database**: PostgreSQL (via Docker)
- **Real-time**: [Socket.io](https://socket.io/)
- **Media Processing**: FFmpeg (for audio duration extraction)

### Infrastructure
- **Containerization**: Docker & Docker Compose

## 📦 Installation & Setup

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running.
- [Git](https://git-scm.com/)

### Quick Start (Docker)

1. **Clone the repository**
   ```bash
   git clone https://github.com/Abdulmohsen-almutlaq/MusicWebsite.git
   cd MusicWebsite
   ```

2. **Environment Setup**
   Create a `.env` file in the root directory (or ensure the existing one is configured):
   ```env
   # Example .env variables
   POSTGRES_USER=user
   POSTGRES_PASSWORD=password
   POSTGRES_DB=musicdb
   DATABASE_URL=postgresql://user:password@db:5432/musicdb
   JWT_SECRET=your_super_secret_key
   SITE_PASSWORD=your_site_access_password
   ```

3. **Run with Docker Compose**
   This command will build the frontend and backend images and start the database.
   ```bash
   docker-compose up -d --build
   ```

4. **Access the Application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:3001`

## 📂 Project Structure

```
MusicWebsite/
├── music-frontend/         # Next.js Client Application
│   ├── src/app/            # App Router Pages
│   ├── src/components/     # Reusable UI Components
│   ├── src/hooks/          # Custom React Hooks (useHome, etc.)
│   └── ...
├── music-backend/          # Express.js Server
│   ├── src/controllers/    # Request Handlers
│   ├── src/routes/         # API Routes
│   ├── prisma/             # Database Schema
│   └── ...
├── data/                   # Persisted Data (Music files, Covers, DB)
└── docker-compose.yml      # Container Orchestration
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
