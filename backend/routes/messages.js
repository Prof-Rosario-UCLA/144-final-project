const express = require('express');
const Message = require('../models/Message');
const router = express.Router();

// Fetch messages in a conversation (with optional pagination)
// GET /messages/:chatId?before=<ISODate>&limit=50
router.get('/:chatId/', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { before = Date.now().toISOString() , limit = 50 } = req.query; // pagination

    const msgs = await Message
      .find({ chat: chatId, createdAt: { $lt: new Date(before) } })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .populate('sender', 'username');
    res.status(200).json(msgs.reverse());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /messages/:chatId/
router.post('/:chatId/messages', async (req, res) => {
    try {
      const { chatId } = req.params;
      const { text }   = req.body;

      const msg = await Message.create({
        chat: chatId,
        sender: req.user.userId,
        text,
        // media will be done later
      });

      await msg.populate('sender', 'username').execPopulate();

      res.status(201).json(msg);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = router;
