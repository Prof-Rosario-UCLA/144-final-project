const express = require('express');
const Chat = require('../models/Chat');
const router = express.Router();

// create/get(if exists) chat with two ppl
router.post('/', async (req, res) => {
    try {
        let { participants } = req.body;
        if (!Array.isArray(participants) || participants.length !== 2) return res.status(400).json({ error: 'Must provide exactly two participant IDs.' });
        
        participants = participants.map(String).sort();

        const key_search = participants[0] + "+" + participants[1]

        let convo = await Chat.findOne({ name: key_search });
        if (!convo) convo = await Chat.create({ 
            name: key_search,
            participants 
        });
        
        res.status(200).json(convo);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });


// get all existing for me
router.get('/:id', async (req, res) => {
    try {
        // console.log(req.user, req.body)
        const me = req.params.id;
        const convos = await Chat
                            .find({ participants: me })
                            .populate('participants', 'username');

        res.status(200).json(convos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
  
module.exports = { router };