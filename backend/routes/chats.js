const express = require('express');
const Chat = require('../models/Chat');
const router = express.Router();

// create/get(if exists) chat with two ppl
router.post('/', async (req, res) => {
    try {
      let { participants } = req.body;
      if (!Array.isArray(participants) || participants.length !== 2) return res.status(400).json({ error: 'Must provide exactly two participant IDs.' });
      
      participants = participants.map(String).sort();
  
      let convo = await Chat.findOne({ participants });
      if (!convo) convo = await Chat.create({ participants });
      
      res.status(200).json(convo);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });


// get all existing for me
router.get('/', async (req, res) => {
    try {
        const me = req.user.userId;
        const convos = await Chat
                            .find({ participants: me })
                            .populate('participants', 'username');

        res.status(200).json(convos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
  
  module.exports = router;