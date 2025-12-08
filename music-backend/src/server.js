require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const trackRoutes = require('./routes/trackRoutes');
const playlistRoutes = require('./routes/playlistRoutes');
const userRoutes = require('./routes/userRoutes');
const feedRoutes = require('./routes/feedRoutes');
const siteGuard = require('./middleware/siteGuard');
const { globalLimiter } = require('./middleware/rateLimiters');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(compression()); // Compress all responses
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: '*', // Allow all origins (or specify your frontend URL)
  exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length', 'Content-Type']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply Global Rate Limiter to all API routes
app.use('/api', globalLimiter);

// Static files for covers (Publicly accessible so images load easily)
app.use('/covers', express.static(path.join(__dirname, '../data/covers')));

// GLOBAL SITE GUARD
// Protects all API routes. You must have the password to even talk to the API.
app.use('/api', siteGuard);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/users', userRoutes);
app.use('/api/feed', feedRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('Music Streaming API is running');
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Initialize Socket.io
const io = require('./socket').init(server);
io.on('connection', socket => {
  console.log('Client connected:', socket.id);
});
