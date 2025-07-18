const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : req.cookies?.authToken;

  if (!token) {
    console.error('No token provided');
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.userId) {
      req.user = { id: decoded.userId, name: decoded.name };
    } else if (decoded.adminId) {
      req.admin = { id: decoded.adminId, name: decoded.name || 'admin' };
    } else {
      console.error('Token missing required identifier');
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to restrict access to admin only
const isAdmin = (req, res, next) => {
  if (!req.admin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

module.exports = authMiddleware;
module.exports.isAdmin = isAdmin;
