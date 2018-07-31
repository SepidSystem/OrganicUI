const WebSocketServer = require("ws").Server
    , WebSocketWrapper = require("ws-wrapper");
var wss = new WebSocketServer({port: 3001});
var sockets = new Set();
wss.on("connection", (socket) => {
    var socket = new WebSocketWrapper(socket);
    sockets.add(socket);
    socket.on("msg", function(from, msg) {
        // `this` refers to the WebSocketWrapper instance
        console.log(`Received message from ${from}: ${msg}`);
        // Relay message to all clients
        sockets.forEach((socket) => {
            socket.emit("msg", from, msg);
        });
    });
    socket.on("disconnect", () => {
        sockets.delete(socket);
    });
});