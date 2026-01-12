const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

const authenticateToken = (req, res, next) => {
  // Allow OPTIONS requests for CORS preflight
  if (req.method === 'OPTIONS') {
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access Token Required' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid Token' });
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken, SECRET_KEY };
