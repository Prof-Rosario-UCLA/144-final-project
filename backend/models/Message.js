import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectID, ref: 'User', required: true },
  text: String,
  media: [{
    url: String,         
    type: { type: String, enum: ['image','video','audio'] }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);