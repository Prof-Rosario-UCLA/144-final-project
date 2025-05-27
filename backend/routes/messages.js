const express = require('express');
const Message = require('../models/Message');
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
router.post('/:chatId/', async (req, res) => {
    try {
      const { chatId } = req.params;
      const { text, sender, receiver } = req.body;

      const msg = await Message.create({
        chat: chatId,
        sender,
        receiver,
        text,
        // media will be done later
      });

    //   await msg.populate('sender', 'username').execPopulate();

      res.status(201).json(msg);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = { router };
