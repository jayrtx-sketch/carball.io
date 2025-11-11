/**
 * CarsOccer.io - High-Performance Multiplayer Car Soccer Game
 * Using uWebSockets.js for maximum performance and scalability
 */

function UncaughtExceptionHandler(err) {
    console.log("Uncaught Exception Encountered!!");
    console.log("err: ", err);
    console.log("Stack trace: ", err.stack);
    setInterval(function () { }, 1000);
}

const uWS = require('uWebSockets.js');
const fs = require('fs');
const path = require('path');
const Matter = require("matter-js");

// Import classes
const Game = require('./classes/Game');
const config = require("./config");

process.on('uncaughtException', UncaughtExceptionHandler);

// Game management
const Games = {
    "lobby": new Game("lobby", "lobby")
};

// Hide ball in lobby
Games.lobby.ball.x = -1000;
Games.lobby.ball.y = -1000;

// Socket management
const sockets = new Map();
let socketIdCounter = 0;

// Create uWebSockets.js app
const app = uWS.App({});

// Serve static files
app.get('/*', (res, req) => {
    const url = req.getUrl();
    let filePath;
    
    if (url === '/' || url === '/index.html') {
        filePath = path.join(__dirname, 'dist', 'index.html');
    } else {
        // Try dist first, then assets
        filePath = path.join(__dirname, 'dist', url);
        if (!fs.existsSync(filePath)) {
            filePath = path.join(__dirname, 'assets', url);
        }
    }
    
    res.onAborted(() => {
        res.aborted = true;
    });
    
    fs.readFile(filePath, (err, data) => {
        if (res.aborted) return;
        
        if (err) {
            res.writeStatus('404 Not Found');
            res.end('Not found');
            return;
        }
        
        // Set content type
        const ext = path.extname(filePath);
        const contentTypes = {
            '.html': 'text/html',
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.gif': 'image/gif'
        };
        
        res.writeHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
        res.end(data);
    });
});

// WebSocket handling
app.ws('/*', {
    compression: uWS.SHARED_COMPRESSOR,
    maxPayloadLength: 16 * 1024,
    idleTimeout: 60,
    maxBackpressure: 1024 * 1024,
    
    upgrade: (res, req, context) => {
        const ip = req.getHeader('x-forwarded-for') || '127.0.0.1';
        
        res.upgrade(
            {
                ip: ip,
                id: `socket_${socketIdCounter++}_${Date.now()}`
            },
            req.getHeader('sec-websocket-key'),
            req.getHeader('sec-websocket-protocol'),
            req.getHeader('sec-websocket-extensions'),
            context
        );
    },
    
    open: (ws) => {
        ws._carballserver = "lobby";
        
        const socket = {
            id: ws.id,
            ws: ws,
            _carballserver: "lobby",
            
            emit: (event, ...args) => {
                const packet = JSON.stringify([event, args]);
                return ws.send(packet, false, false);
            },
            
            on: (event, handler) => {
                if (!ws._handlers) ws._handlers = new Map();
                ws._handlers.set(event, handler);
            },
            
            close: () => {
                ws.end(1000, 'Closing connection');
            },
            
            disconnect: () => {
                ws.end(1000, 'Disconnecting');
            }
        };
        
        sockets.set(ws.id, socket);
        socket.emit("id", ws.id);
        
        console.log('User connected:', ws.id);
        
        // Set up event handlers
        socket.on("join", (name) => {
            Games[socket._carballserver].join(socket, name);
        });
        
        socket.on("chat", (chat) => {
            Games[socket._carballserver].handleChat(socket, chat);
        });
        
        socket.on("boost", () => {
            Games[socket._carballserver].handleBoost(socket);
        });
        
        socket.on("move", (directions) => {
            Games[socket._carballserver].handleMovement(socket, directions);
        });
    },
    
    message: (ws, message, isBinary) => {
        const socket = sockets.get(ws.id);
        if (!socket) return;
        
        try {
            const decoder = new TextDecoder();
            const text = decoder.decode(message);
            const data = JSON.parse(text);
            
            if (!Array.isArray(data) || data.length !== 2) return;
            
            const [event, args] = data;
            const handler = ws._handlers?.get(event);
            
            if (handler && Array.isArray(args)) {
                handler(...args);
            }
        } catch (e) {
            console.error('Message parse error:', e);
        }
    },
    
    close: (ws, code, message) => {
        const socket = sockets.get(ws.id);
        if (!socket) return;
        
        Games[socket._carballserver].removePlayer(socket);
        sockets.delete(ws.id);
        
        console.log('User disconnected:', ws.id);
    }
});

// Matchmaking system
let lastMatchMade = Date.now();
function matchMaker(lobby) {
    // Clean up empty games
    for (let i in Games) {
        if (Games[i].count === 0 && i !== "lobby") {
            delete Games[i];
        }
    }

    const lobbyPlayers = sockets.size;
    if (lobbyPlayers < config.MIN_PLAYERS_FOR_MATCH) return;
    
    // Create match if enough players or timeout
    const shouldCreateMatch = lobbyPlayers >= config.MIN_PLAYERS_FOR_MATCH || 
                             (Date.now() - lastMatchMade > config.MIN_MATCH_WAITTIME * 1000);
    
    if (!shouldCreateMatch) return;
    if (Object.keys(Games).length > config.MAX_MATCHES) return;

    const id = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    Games[id] = new Game(id);

    console.log(`Creating game ${id} with ${lobbyPlayers} players in lobby`);
    lastMatchMade = Date.now();

    let count = 0;
    const socketsArray = Array.from(sockets.values());
    
    for (let socket of socketsArray) {
        if (count >= config.MAX_PLAYERS_PER_MATCH) break;
        if (socket._carballserver !== "lobby") continue;

        let playerInfo = lobby.players[socket.id];
        if (!playerInfo) continue;
        
        lobby.removePlayer(socket);
        socket._carballserver = id;
        Games[id].join(socket, playerInfo.name);
        sockets.delete(socket.id); // Remove from lobby queue
        
        count++;
    }
    
    console.log(`Game ${id} started with ${count} players`);
}

// Run matchmaker every 5 seconds
setInterval(() => {
    matchMaker(Games.lobby);
}, 5000);

// Game update loop at 60 FPS
let lastUpdate = Date.now();
setInterval(() => {
    const now = Date.now();
    const delta = now - lastUpdate;
    
    for (let i in Games) {
        Games[i].update(lastUpdate);
    }
    
    lastUpdate = now;
}, 1000 / config.PHYSICS_FPS);

// Performance monitoring
setInterval(() => {
    const stats = {
        games: Object.keys(Games).length,
        totalPlayers: Object.values(Games).reduce((sum, game) => sum + game.count, 0),
        lobbyPlayers: Games.lobby.count
    };
    console.log('Server stats:', stats);
}, 30000);

// Start server
app.listen(3000, (token) => {
    if (token) {
        console.log('CarsOccer.io server listening on port 3000');
        console.log('High-performance mode with uWebSockets.js enabled');
    } else {
        console.log('Failed to listen on port 3000');
    }
});
