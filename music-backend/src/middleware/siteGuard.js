module.exports = (req, res, next) => {
  const globalPassword = process.env.GLOBAL_ACCESS_PASSWORD;

  // If no password is set in env, skip the check (or you could choose to block)
  if (!globalPassword) {
    return next();
  }

  // EXCEPTION: Allow Email Verification to pass without the password
  // The verification token itself acts as authentication for this specific action.
  if (req.originalUrl.startsWith('/api/auth/verify')) {
    return next();
  }

  // Check header, then query param (both snake_case and kebab-case)
  const requestPassword = req.headers['x-site-password'] || 
                          req.query.site_password || 
                          req.query['x-site-password'];

  if (requestPassword === globalPassword) {
    return next();
  }

  return res.status(403).json({ 
    message: 'Access Denied. This is a private site. Please provide the correct Site Password in the "x-site-password" header.' 
  });
};
