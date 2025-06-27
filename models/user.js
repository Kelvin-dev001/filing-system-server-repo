const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String }, // Hashed password (for local login)
  googleId: { type: String }, // For Google login
  name: { type: String },     // Display name
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);