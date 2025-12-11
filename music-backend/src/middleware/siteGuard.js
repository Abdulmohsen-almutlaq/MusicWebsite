module.exports = (req, res, next) => {
  const globalPassword = process.env.GLOBAL_ACCESS_PASSWORD;

  // If no password is set in env, skip the check (or you could choose to block)
  if (!globalPassword) {
    return next();
  }

  // EXCEPTION: Allow Email Verification to pass without the password
  // The verification token itself acts as authentication for this specific action.
  // We check both originalUrl (full path) and url (relative path) to be safe
  if (req.originalUrl.includes('/auth/verify') || req.url.includes('/auth/verify')) {
    return next();
  }

  // Check header, then query param, then cookie
  const requestPassword = req.headers['x-site-password'] || 
                          req.query.site_password || 
                          req.query['x-site-password'] ||
                          req.cookies?.site_password;

  // Check against Global Password OR Admin Password
  if (requestPassword === globalPassword || (process.env.ADMIN_SITE_PASSWORD && requestPassword === process.env.ADMIN_SITE_PASSWORD)) {
    return next();
  }

  console.log(`[SiteGuard] Access Denied. Received: '${requestPassword}', Expected: '${globalPassword}' or Admin Pass`);

  return res.status(403).json({ 
    message: 'Access Denied. This is a private site. Please provide the correct Site Password in the "x-site-password" header.' 
  });
};
