require('dotenv').config();
const cluster = require('cluster');
const os = require('os');
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const path = require('path');
const { setupMaster, setupWorker } = require('@socket.io/sticky');
const { createAdapter, setupPrimary } = require('@socket.io/cluster-adapter');

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
process.env.UV_THREADPOOL_SIZE = Math.max(os.cpus().length, 4);

const PORT = process.env.PORT || 3000;

if (cluster.isPrimary) {
  // --- MASTER PROCESS ---
  const numCPUs = os.cpus().length;
  console.log(`Master ${process.pid} is running`);
  console.log(`Forking ${numCPUs} workers...`);

  const httpServer = http.createServer();

  // Setup Socket.io Cluster Adapter (Master)
  // This handles sticky sessions and load balancing for both HTTP and WebSockets
  setupMaster(httpServer, {
    loadBalancingMethod: "least-connection",
  });

  // Setup the cluster adapter to sync events between workers
  setupPrimary();

  httpServer.listen(PORT, () => {
    console.log(`Load Balancer (Master) running on port ${PORT}`);
  });

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });

} else {
  // --- WORKER PROCESS ---
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
    res.send(`Music Streaming API is running (Worker ${process.pid})`);
  });

  // Create HTTP Server for Worker
  const httpServer = http.createServer(app);

  // Initialize Socket.io
  const io = require('./socket').init(httpServer);
  
  // Use the cluster adapter to sync events
  io.adapter(createAdapter());

  // Setup Sticky Sessions (Worker)
  setupWorker(io);

  io.on('connection', socket => {
    // console.log(`Client connected to Worker ${process.pid}:`, socket.id);
  });

  // Note: We do NOT call httpServer.listen() here. 
  // The Master process handles the port and forwards requests to us.

  // Graceful Shutdown
  process.on('SIGTERM', async () => {
    console.log(`Worker ${process.pid} stopping...`);
    await prisma.$disconnect();
    process.exit(0);
  });
}
