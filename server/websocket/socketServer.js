const { WebSocketServer } = require("ws");

module.exports = function setupSocketServer(server) {

    const wss = new WebSocketServer({
        server
    });

    wss.on("connection", (ws) => {

        console.log("🎤 Client connected");

        ws.on("close", () => {

            console.log("Client disconnected");

        });

    });

};