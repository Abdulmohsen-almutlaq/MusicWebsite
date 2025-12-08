const rateLimit = require('express-rate-limit');

// General API Limiter (Basic DDoS protection)
// 300 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 300, 
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' }
});

// Like/Unlike Limiter
// 20 likes per 1 minute per IP
// Prevents rapid toggling or mass liking
const likeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'You are liking too fast. Please slow down.' }
});

// Comment Limiter
// 5 comments per 1 minute per IP
// Prevents spamming comments
const commentLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'You are commenting too fast. Please slow down.' }
});

// Play Count Limiter
// 60 plays per 1 minute per IP
// Allows for skipping songs but prevents artificial play count inflation
const playLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many play requests.' }
});

module.exports = {
  globalLimiter,
  likeLimiter,
  commentLimiter,
  playLimiter
};
