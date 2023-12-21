const { Server } = require("socket.io");

module.exports.init = (server) => {
    const io = new Server(server, { cors: { 'origin': '*' } });
    io.on('connection', (socket) => {
        console.log('socket connection success');

        socket.on('addNotification', (req) => {
        });
    });
}