import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
  name: String,
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

ChatSchema.pre("validate", function(next) {
    if (this.participants.length !== 2) {
        return next(new Error("We only allow one-on-one chats"));
    }
    next();
});

ChatSchema.index(
    { "participants" : 1},
    { unique: true, partialFilterExpressio: { "participants.1": { $exists: true } } }
);

module.exports = mongoose.model('Chat', ChatSchema);