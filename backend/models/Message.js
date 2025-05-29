// import mongoose from 'mongoose';
const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: String,
  media: String,         
  isMedia: {
    type: String,
    enum: ["none", "image", "audio"],
    default: "none"
  },
  createdAt: { type: Date, default: Date.now },
  // hasBeenRead: { type: Boolean, default: false }
});

module.exports = mongoose.model('Message', MessageSchema);