function UncaughtExceptionHandler(err) {
    console.log("Uncaught Exception Encountered!!");
    console.log("err: ", err);
    console.log("Stack trace: ", err.stack);
    setInterval(function () { }, 1000);
}

const uWS = require('uWebSockets.js');
const Matter = require("matter-js");
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Import classes
const Game = require('./classes/Game');
const config = require("./config");

process.on('uncaughtException', UncaughtExceptionHandler);

// Create games here
const Games = {
    "lobby": new Game("lobby", "lobby")
}

// Hide ball in lobby
Games.lobby.ball.x = -1000;
Games.lobby.ball.y = -1000;

// THIS IS THE WAITLIST
const sockets = {};
const socketMap = new Map(); // Map from uWS socket to our socket object

// Create a socket wrapper to maintain compatibility with existing Game class
class SocketWrapper {
    constructor(uwsSocket, id) {
        this.id = id;
        this.uwsSocket = uwsSocket;
        this._carballserver = "lobby";
        this.isAlive = true;
    }

    emit(event, ...data) {
        if (!this.uwsSocket) return;
        try {
            const packet = JSON.stringify([event, data]);
            this.uwsSocket.send(packet, false);
        } catch (e) {
            console.error("Error emitting:", e);
        }
    }

    close() {
        if (this.uwsSocket) {
            this.uwsSocket.end(1000, "Server closing");
        }
    }

    disconnect() {
        this.close();
    }
}

const app = uWS.App({});

// Serve static files
app.get('/*', (res, req) => {
    const url = req.getUrl();
    
    // Serve index.html for root
    if (url === '/' || url === '') {
        try {
            const htmlPath = path.join(__dirname, 'dist', 'index.html');
            if (fs.existsSync(htmlPath)) {
                const html = fs.readFileSync(htmlPath, 'utf8');
                res.writeStatus('200 OK');
                res.writeHeader('Content-Type', 'text/html');
                res.end(html);
            } else {
                // Fallback HTML if dist doesn't exist
                res.writeStatus('200 OK');
                res.writeHeader('Content-Type', 'text/html');
                res.end(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Carsoccer.io</title>
                        <link rel="stylesheet" href="/css/styles.css">
                    </head>
                    <body>
                        <div class="container">
                            <h1>Carsoccer.io<sub style="font-size: 10px; color: blue;">beta!</sub></h1>
                            <input type="text" id="nameInput" placeholder="Enter Your Name">
                            <button id="playButton">Play</button>
                            <br />
                            <p><b>Controls:</b></p>
                            <input type="radio" name="controls" id="controls" value="keys" checked/>
                            <label for="controls">Keyboard</label>
                            <input type="radio" name="controls" id="controls2" value="mouse"/>
                            <label for="controls2">Mouse</label>
                        </div>

                        <div id="gameGUI">
                            <p id="score"><z id="blue">0</z> - <z id="red">0</z></p>
                            <p id="time">0:00</p>
                            <p id="speedometer">0mph</p>
                            <p id="goal">AAAA</p>
                            <p id="countdown">3</p>

                            <div class="boostBar">
                                <div id="boostBarPercent"></div>
                            </div>

                            <div id="mobile" style="visibility: hidden;">
                                <div>
                                    <div class="mobilebig" style="background: rgba(0, 0, 0, 0); border: none;"></div>
                                    <div class="mobilebig mobileControlUp" z="up">up</div>
                                </div>
                                <div style="justify-content: flex-end;">
                                    <div class="mobilesmall mobileControlAttack" z="chat">chat</div>
                                </div>
                                <div>
                                    <div class="mobilebig mobileControlLeft" z="left">left</div>
                                    <div class="mobilebig mobileControlDown" z="down">down</div>
                                    <div class="mobilebig mobileControlRight" z="right">right</div>
                                </div>
                                <div style="justify-content: flex-end;">
                                    <div class="mobilesmall mobileControlDash" z="boost">boost</div>
                                </div>
                            </div>
                        </div>

                        <div id="matchInfo">
                            <h1 id="winlose">You lost - [] team wins! </h1>
                            <hr />
                            <p>Blue Team Goals: <z id="blueFinal">0</z> </p>
                            <p>Red Team Goals: <z id="redFinal">0</z></p>
                            <button onclick="exit()">Main Menu</button>
                        </div>

                        <script src="/bundle.js"></script>
                    </body>
                    </html>
                `);
            }
        } catch (e) {
            console.error("Error serving HTML:", e);
            res.writeStatus('500 Internal Server Error');
            res.end();
        }
        return;
    }

    // Serve CSS files
    if (url.startsWith('/css/')) {
        try {
            const filePath = path.join(__dirname, 'assets', url);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath);
                res.writeStatus('200 OK');
                res.writeHeader('Content-Type', 'text/css');
                res.end(content);
            } else {
                res.writeStatus('404 Not Found');
                res.end();
            }
        } catch (e) {
            res.writeStatus('500 Internal Server Error');
            res.end();
        }
        return;
    }

    // Serve JS bundle
    if (url === '/bundle.js') {
        try {
            const bundlePath = path.join(__dirname, 'dist', 'bundle.js');
            if (fs.existsSync(bundlePath)) {
                const content = fs.readFileSync(bundlePath);
                res.writeStatus('200 OK');
                res.writeHeader('Content-Type', 'application/javascript');
                res.end(content);
            } else {
                res.writeStatus('404 Not Found');
                res.end();
            }
        } catch (e) {
            res.writeStatus('500 Internal Server Error');
            res.end();
        }
        return;
    }

    // For other static files, return 404
    res.writeStatus('404 Not Found');
    res.end();
});

app.ws('/*', {
    /* Options */
    compression: uWS.SHARED_COMPRESSOR,
    maxPayloadLength: 16 * 1024,
    idleTimeout: 32,
    maxBackpressure: 1024 * 1024,
    
    /* Handlers */
    open: (ws, req) => {
        const id = uuidv4();
        const socket = new SocketWrapper(ws, id);
        socketMap.set(ws, socket);
        sockets[id] = socket;
        
        socket.emit("id", id);
        console.log('a user connected:', id);
    },

    message: (ws, message, isBinary) => {
        const socket = socketMap.get(ws);
        if (!socket) return;

        try {
            let packet;
            if (isBinary) {
                // Handle binary messages if needed
                return;
            }

            const text = Buffer.from(message).toString('utf8');
            packet = JSON.parse(text);

            if (!Array.isArray(packet) || packet.length !== 2) {
                return;
            }

            const [event, data] = packet;

            switch (event) {
                case "join":
                    if (Array.isArray(data) && data.length > 0) {
                        Games[socket._carballserver].join(socket, data[0]);
                    }
                    break;

                case "chat":
                    if (Array.isArray(data) && data.length > 0) {
                        Games[socket._carballserver].handleChat(socket, data[0]);
                    }
                    break;

                case "boost":
                    Games[socket._carballserver].handleBoost(socket);
                    break;

                case "move":
                    if (Array.isArray(data) && data.length > 0) {
                        Games[socket._carballserver].handleMovement(socket, data[0]);
                    }
                    break;
            }
        } catch (e) {
            console.error("Error handling message:", e);
        }
    },

    close: (ws, code, message) => {
        const socket = socketMap.get(ws);
        if (!socket) return;

        Games[socket._carballserver].removePlayer(socket);
        delete sockets[socket.id];
        socketMap.delete(ws);
        console.log("leftgame:", socket.id);
    }
});

let lastMatchMade = Date.now();
function matchMaker(lobby) {
    for (let i in Games) { //kill empty games
        if (Games[i].count == 0 && i !== "lobby") {
            delete Games[i];
        }
    }

    if (Object.keys(sockets).length < 2) return;
    //                                            1 minute until match is forced
    if (!(Object.keys(sockets).length >= 6 || Date.now() - lastMatchMade > config.MIN_MATCH_WAITTIME * 1000)) return;
    if (Object.keys(Games).length > config.MAX_MATCHES) return; //max game limit

    let id = Math.random() * 123 + "idk what to do for id lol";
    Games[id] = new Game(id);

    console.log("creating game");
    lastMatchMade = Date.now();

    let count = 0;
    for (let i in sockets) {
        if (count >= 6) break;

        let playerInfo = lobby.players[sockets[i].id];
        lobby.removePlayer(sockets[i]);
        sockets[i]._carballserver = id;
        Games[id].join(sockets[i], playerInfo.name);
        delete sockets[i]; //out of da waitlist

        count++;
    }
}

setInterval(() => {
    matchMaker(Games.lobby);
}, 5000);

let lastUpdate = Date.now();
const tickInterval = 1000 / config.TICK_RATE;
let updateCounter = 0;

// Update and game logic - optimized tick rate
setInterval(() => {
    const now = Date.now();
    const delta = now - lastUpdate;
    
    for (let i in Games) {
        Games[i].update(delta);
    }

    lastUpdate = now;
}, tickInterval);

const port = process.env.PORT || 3000;
app.listen(port, (token) => {
    if (token) {
        console.log('Listening on port', port);
    } else {
        console.log('Failed to listen on port', port);
    }
});
