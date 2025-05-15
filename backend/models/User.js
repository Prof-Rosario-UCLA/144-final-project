import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, sparse: true },
  passwordHash: { type: String, select: false },

  provider: { type: String, enum: ['google'], default: 'google', required: true },
  providerId: { type: String, required: true, index: true },
  
  email: { type: String, required: true, unique: true },
  emailVerified: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);