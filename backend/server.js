require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require('cors');
const passport = require('passport');
const { router: userRoutes, verifyToken } = require('./routes/users');
const { router: messageRoutes } = require('./routes/messages');
const { router: chatRoutes } = require('./routes/chats');


const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'session_dne',
    resave: false,
    saveUninitialized: false,
  })
);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

app.use('/api/users', userRoutes);
// these don't work yet for some reason
// app.use('/api/messages', messageRoutes);
// app.use('/api/chats', chatRoutes);

const httpServer = require("http").createServer(app);
//no idea if this is right
const socketPort = process.env.SOCKET_PORT || 3002;
httpServer.listen(socketPort, () => {
  console.log(`http Socket is running on port ${socketPort}`);
});
const io = require("socket.io")(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  },
});

const socketMap = new Map();

io.use((socket, next) => {
  const { username, user_id } = socket.handshake.auth;
  if (!username || !user_id) return next(new Error("invalid user or id"));
  socket.username = username;
  socket.userId = user_id;
  next();
});

io.on("connection", (socket) => {

  socketMap.set(socket.userId, socket.id);

  socket.on("disconnect", () => {
    socketMap.delete(socket.userId);
  });

  socket.on("private message", ({ content, to }) => {
    const targetId = socketMap.get(to);
    socket.to(targetId).emit("private message", {
        content: content,
        from: socket.userId,
        fromUser: socket.username
    });
  });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});