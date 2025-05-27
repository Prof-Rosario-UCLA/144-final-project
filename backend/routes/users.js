require('dotenv').config();
const express = require('express');
const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/users/auth/google/callback',
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ providerId: profile.id, provider: 'google' });
        
        if (user) return done(null, user);
        
        user = new User({
          provider: 'google',
          providerId: profile.id,
          email: profile.emails[0].value,
          emailVerified: profile.emails[0].verified || true,
          username: profile.displayName.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000)
        });
        
        await user.save();
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

router.use(passport.initialize());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});


router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/' }),
  (req, res) => {
    try {
      const token = jwt.sign(
        { 
          id: req.user._id,
          email: req.user.email,
          username: req.user.username
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: false, 
        maxAge: 7 * 24 * 60 * 60 * 1000 
      });

      res.redirect(`${process.env.FRONTEND_URL}/?token=${token}`);
    } catch (error) {
      console.error('Error creating token:', error);
      res.redirect(`${process.env.FRONTEND_URL}`);
    }
  }
);

const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }
    
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token verification failed, authorization denied' });
  }
};

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server error' });
  }
});


router.post('/validate-token', (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ valid: false });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ 
      valid: true, 
      user: {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email
      }
    });
  } catch (error) {
    res.json({ valid: false });
  }
});

router.get('/', async (req, res) => {
  try {
    const users = await User.find({})
      .select('username email')
      .lean(); 

    res.json(users);
  } catch (error) {
    console.log("/users/ err:", error)
    res.status(500).json({ message: 'Internal server error' });
  }
})


router.get('/:query', async (req, res) => {
  try {
    const query = req.params.query;

    const filter = query
      ? { 'username': { $regex: `${query}`, $options: 'i' } }
      : {};


    const users = await User.find(filter)
      .select('username email')
      .lean();

    res.json(users);
  } catch (error) {
    console.log("/users/ err:", error)
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = { router, verifyToken };