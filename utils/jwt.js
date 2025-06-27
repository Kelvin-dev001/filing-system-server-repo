const jwt = require('jsonwebtoken');

function generateToken(user) {
  // Only include safe, non-sensitive user info in the token!
  const payload = {
    id: user._id,
    email: user.email,
    name: user.name,
  };
  // Token valid for 1 day
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
}

module.exports = { generateToken };