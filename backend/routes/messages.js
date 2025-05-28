const express = require('express');
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const router = express.Router();

// Fetch messages in a conversation (with optional pagination)
// GET /messages/:chatId?before=<ISODate>&limit=50
router.get('/:chatId/:before', async (req, res) => {
  try {
    const { chatId, before } = req.params;
    // const { before } = req.query; // pagination
    const limit = 50;

    // console.log(chatId, before)

    const msgs = await Message
      .find({ chat: chatId, createdAt: { $lte: before } })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .populate('sender', 'username')
      .populate('receiver', 'username');
      
    res.status(200).json(msgs.reverse());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /messages/:chatId/
// returns new message sent and updated chat with latestSent
router.post('/:chatId/', async (req, res) => {
    try {
        const { chatId } = req.params;
        const { text, sender, receiver } = req.body;

        const newMsg = await Message.create({
            chat: chatId,
            sender,
            receiver,
            text,
            // media will be done later
        })
        
        const msg = await Message.findById(newMsg._id)
        .populate('sender', 'username')
        .populate('receiver', 'username');

        const chat = await Chat.findByIdAndUpdate(
            chatId, {
                $set: {
                    latestMessage: msg._id,
                    'latestRead.$[senderElem].hasRead': true,
                    'latestRead.$[receiverElem].hasRead': false
                }
            }, {
                new: true,
                arrayFilters: [
                    { 'senderElem.user': sender },
                    { 'receiverElem.user': receiver }
                ]
            }).populate('participants', 'username')
            .populate({
                path: 'latestMessage',
                populate: {
                    path: 'sender',
                    select: 'username'
                }
            }).exec();

        res.status(201).json({ message: msg, chat });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = { router };
