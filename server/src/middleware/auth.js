const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function protect(req, res, next) {
  const header = req.headers.authorization || '';

  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorised — no token provided' });
  }

  try {
    const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Not authorised — user no longer exists' });
    }
    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorised — token is invalid or expired' });
  }
}

module.exports = { protect };
