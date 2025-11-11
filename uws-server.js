const uWS = require('uWebSockets.js');
const { v4: uuidv4 } = require('uuid');

/**
 * High-performance WebSocket server using uWebSockets.js
 * Optimized for handling high player loads efficiently
 */
class UWSServer {
    constructor() {
        this.clients = new Map();
        this.connectedIPs = new Map();
        this.handlers = new Map();
        this.ipLimit = 100;
        
        // Performance monitoring
        this.stats = {
            messagesReceived: 0,
            messagesSent: 0,
            bytesReceived: 0,
            bytesSent: 0
        };
    }

    /**
     * Creates and configures the uWebSockets.js server
     */
    create(options = {}) {
        this.ipLimit = options.ipLimit || 100;
        
        const app = uWS.App({});
        
        app.ws('/*', {
            compression: uWS.SHARED_COMPRESSOR,
            maxPayloadLength: 16 * 1024,
            idleTimeout: 60,
            maxBackpressure: 1024 * 1024,
            
            upgrade: (res, req, context) => {
                const ip = req.getHeader('x-forwarded-for') || res.getRemoteAddressAsText();
                const origin = req.getHeader('origin');
                
                // IP limiting
                const ipCount = this.connectedIPs.get(ip) || 0;
                if (ipCount >= this.ipLimit) {
                    res.writeStatus('429 Too Many Requests');
                    res.end('Too many connections from this IP');
                    return;
                }
                
                // Upgrade to WebSocket
                res.upgrade(
                    {
                        ip: ip,
                        id: uuidv4()
                    },
                    req.getHeader('sec-websocket-key'),
                    req.getHeader('sec-websocket-protocol'),
                    req.getHeader('sec-websocket-extensions'),
                    context
                );
            },
            
            open: (ws) => {
                const client = {
                    ws: ws,
                    id: ws.id,
                    ip: ws.ip,
                    isAlive: true,
                    handlers: new Map()
                };
                
                this.clients.set(ws.id, client);
                
                // Update IP count
                const ipCount = this.connectedIPs.get(ws.ip) || 0;
                this.connectedIPs.set(ws.ip, ipCount + 1);
                
                // Emit connection event
                const connectHandler = this.handlers.get('connection');
                if (connectHandler) {
                    connectHandler(this.createClientWrapper(client));
                }
            },
            
            message: (ws, message, isBinary) => {
                const client = this.clients.get(ws.id);
                if (!client) return;
                
                this.stats.messagesReceived++;
                this.stats.bytesReceived += message.byteLength;
                
                try {
                    // Parse JSON message
                    const decoder = new TextDecoder();
                    const text = decoder.decode(message);
                    const data = JSON.parse(text);
                    
                    if (!Array.isArray(data) || data.length !== 2) return;
                    
                    const [event, args] = data;
                    const handler = client.handlers.get(event);
                    
                    if (handler && Array.isArray(args)) {
                        handler(...args);
                    }
                } catch (e) {
                    console.error('Message parse error:', e);
                }
            },
            
            drain: (ws) => {
                // Handle backpressure
                console.log('WebSocket backpressure: ' + ws.getBufferedAmount());
            },
            
            close: (ws, code, message) => {
                const client = this.clients.get(ws.id);
                if (!client) return;
                
                // Update IP count
                const ipCount = this.connectedIPs.get(ws.ip);
                if (ipCount <= 1) {
                    this.connectedIPs.delete(ws.ip);
                } else {
                    this.connectedIPs.set(ws.ip, ipCount - 1);
                }
                
                // Call close handler
                const closeHandler = client.handlers.get('close');
                if (closeHandler) {
                    closeHandler(code, message);
                }
                
                this.clients.delete(ws.id);
            }
        });
        
        return app;
    }

    /**
     * Creates a socket wrapper with familiar Socket.IO-like API
     */
    createClientWrapper(client) {
        return {
            id: client.id,
            ws: client.ws,
            _carballserver: null,
            
            emit: (event, ...args) => {
                const packet = JSON.stringify([event, args]);
                const sent = client.ws.send(packet, false, false);
                
                if (sent) {
                    this.stats.messagesSent++;
                    this.stats.bytesSent += packet.length;
                }
                
                return sent;
            },
            
            on: (event, handler) => {
                client.handlers.set(event, handler);
            },
            
            close: () => {
                client.ws.end(1000, 'Closing connection');
            },
            
            disconnect: () => {
                client.ws.end(1000, 'Disconnecting');
            }
        };
    }

    /**
     * Register event handler
     */
    on(event, handler) {
        this.handlers.set(event, handler);
    }

    /**
     * Broadcast to all clients
     */
    broadcast(event, ...args) {
        const packet = JSON.stringify([event, args]);
        let sent = 0;
        
        this.clients.forEach(client => {
            if (client.ws.send(packet, false, false)) {
                sent++;
            }
        });
        
        this.stats.messagesSent += sent;
        this.stats.bytesSent += packet.length * sent;
    }

    /**
     * Get statistics
     */
    getStats() {
        return {
            ...this.stats,
            connections: this.clients.size,
            uniqueIPs: this.connectedIPs.size
        };
    }
}

module.exports = UWSServer;
