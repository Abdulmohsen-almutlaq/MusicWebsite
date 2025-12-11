require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const path = require('path');

// Routes & Middleware
const authRoutes = require('./routes/authRoutes');
const trackRoutes = require('./routes/trackRoutes');
const playlistRoutes = require('./routes/playlistRoutes');
const userRoutes = require('./routes/userRoutes');
const feedRoutes = require('./routes/feedRoutes');
const siteGuard = require('./middleware/siteGuard');
const { globalLimiter } = require('./middleware/rateLimiters');
const prisma = require('./config/db');

// Optimization: Increase Thread Pool Size for heavy I/O (ffmpeg, fs)
process.env.UV_THREADPOOL_SIZE = Math.max(require('os').cpus().length, 4);

const PORT = process.env.PORT || 3000;

// Create Express App
const app = express();

// Trust Proxy (Required for Nginx + Rate Limiting)
app.set('trust proxy', 1);

// Middleware
app.use(compression()); // Compress all responses
app.use(cookieParser()); // Parse cookies
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: '*',
  exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length', 'Content-Type']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply Global Rate Limiter
app.use('/api', globalLimiter);

// Static files
app.use('/covers', express.static(path.join(__dirname, '../data/covers')));

// Global Site Guard
app.use('/api', siteGuard);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/users', userRoutes);
app.use('/api/feed', feedRoutes);

// Health check
app.get('/', (req, res) => {
  res.send(`Music Streaming API is running (Process ${process.pid})`);
});

// Create HTTP Server
const httpServer = http.createServer(app);

// Initialize Socket.io
const io = require('./socket').init(httpServer);

io.on('connection', socket => {
  // console.log(`Client connected:`, socket.id);
});

// Start Server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful Shutdown
process.on('SIGTERM', async () => {
  console.log(`Process ${process.pid} stopping...`);
  await prisma.$disconnect();
  process.exit(0);
});
