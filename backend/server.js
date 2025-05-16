require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

const httpServer = require("http").createServer(app);
//no idea if this is right
httpServer.listen(3002, () => {
  console.log(`http is running on port 3002`);
});
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});

// middleware auth
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server listening on http://localhost:${port}`);
});