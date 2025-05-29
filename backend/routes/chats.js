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

        let convo = await Chat.findOne({ name: key_search })
        .populate('participants', 'username')
        .populate({
            path: 'latestMessage',
            populate: {
                path: 'sender',
                select: 'username'
            }
        }).exec();
        if (!convo) convo = await Chat.create({ 
            name: key_search,
            participants,
            latestRead: participants.map(p => ({
                user: p,
                hasRead: true
            }))
        });
        
        convo = await convo.populate('participants', 'username');
        
        res.status(200).json(convo);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
});


router.post('/:id/read', async (req, res) => {
    try {
        const chatId = req.params.id;
        const userId = req.body.userId;

        const newChat = await Chat.findByIdAndUpdate(chatId, {
            $set: { "latestRead.$[elem].hasRead": true },
        }, {
            new: true,
            arrayFilters: [{ "elem.user": userId }]
        }).populate('participants', 'username')
        .populate({
            path: 'latestMessage',
            populate: {
                path: 'sender',
                select: 'username'
            }
        }).exec();
        // console.log(newChat)
        
        res.status(200).json(newChat)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Internal server error'})
    }
});

// get all existing for me
router.get('/:id', async (req, res) => {
    try {
        // console.log(req.user, req.body)
        const me = req.params.id;
        const convos = await Chat
        .find({ participants: me })
        .populate('participants', 'username')
        .populate('latestMessage', 'sender receiver text createdAt isMedia'); //add more later

        res.status(200).json(convos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal erver error' });
    }
});
  
module.exports = { router };