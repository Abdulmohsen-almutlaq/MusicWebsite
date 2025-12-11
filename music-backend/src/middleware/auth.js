const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // 1. Check for token in HttpOnly cookie first
    let token = req.cookies?.token;

    // 2. Fallback to Authorization header (for mobile apps or external clients)
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = decoded; // { userId: ... }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed' });
  }
};
