
const onConnect = (_) => (socket) => {
    console.log("connected socket")
    socket.on("message", ({ content, to }) => {
        console.log(to, socket.id, socket.username)
        socket.to(to).emit("private message", {
            content: content,
            from: socket.id,
            fromUser: socket.username
        });
    });
}

module.exports = { onConnect }