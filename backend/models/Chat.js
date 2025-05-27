// models/Chat.js
const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true},
    participants: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        validate: {
            validator: (v) => Array.isArray(v) && v.length === 2,
            message: "A chat must have exactly two participants"
        }
    },
    createdAt: { type: Date, default: Date.now },
    // mostRecentSent: { type: Date }
});

ChatSchema.pre('save', function(next) {
  if (this.participants.length === 2) {
    this.participants.sort();
  }
  next();
});

module.exports = mongoose.model('Chat', ChatSchema);
