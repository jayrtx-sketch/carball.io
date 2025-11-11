# 🚀 Quick Start Guide - CarsOccer.io

Get your multiplayer car soccer game up and running in minutes!

## Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **pnpm**

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This will install:
- uWebSockets.js (high-performance WebSocket server)
- Matter.js (physics engine)
- PixiJS (rendering engine)
- Webpack (build tool)

### 2. Build the Client

```bash
npm run build
```

This compiles and bundles all client-side code into the `dist` folder.

### 3. Start the Server

```bash
npm start
```

The server will start on **port 3000**.

### 4. Play!

Open your browser and navigate to:
```
http://localhost:3000
```

Enter your name and click **Play** to join!

## Development Mode

For active development with auto-rebuild:

```bash
# Terminal 1: Watch and rebuild on changes
npm run watch

# Terminal 2: Start server
npm start
```

## Game Flow

1. **Lobby**: Players wait for match to start
2. **Matchmaking**: When 4+ players are ready, a match is created
3. **Countdown**: 3-second countdown before match starts
4. **Match**: 5-minute game with Blue vs Red teams
5. **Results**: Score display and return to lobby

## Controls

### Keyboard Mode (Default)
- ⬆️ **Up Arrow**: Forward
- ⬇️ **Down Arrow**: Backward
- ⬅️ **Left Arrow**: Turn left
- ➡️ **Right Arrow**: Turn right
- **Space**: Boost

### Mouse Mode
- 🖱️ **Mouse**: Aim direction
- ⬆️ **Up Arrow**: Move forward
- **Space**: Boost

## Configuration

Edit `config.js` to customize:

```javascript
{
  MATCH_LENGTH: 5,              // Minutes per match
  MIN_PLAYERS_FOR_MATCH: 4,     // Min players to start
  MAX_PLAYERS_PER_MATCH: 10,    // Max players per game
  BOOST_STRENGTH: 1.8,          // Boost power multiplier
  MAX_BALL_SPEED: 35,           // Ball speed limit
  MAX_PLAYER_SPEED: 25,         // Car speed limit
}
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
kill $(lsof -ti:3000)
```

### Build Errors
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

### uWebSockets.js Installation Issues

If uWebSockets.js fails to install, you may need build tools:

**macOS:**
```bash
xcode-select --install
```

**Ubuntu/Debian:**
```bash
sudo apt-get install build-essential
```

**Windows:**
```bash
npm install --global windows-build-tools
```

Alternatively, use legacy WebSocket server:
```bash
npm run start:legacy
```

## Testing with Multiple Players

Open multiple browser windows/tabs or use different browsers:
- Window 1: Blue team player
- Window 2: Red team player
- Window 3: Another blue team player
- etc.

Minimum 4 players needed to start a match!

## Performance Tips

### Server
- Close unnecessary processes
- Use Node.js v18+ for better performance
- Monitor with `top` or Task Manager

### Client
- Use hardware acceleration in browser
- Close other browser tabs
- Disable browser extensions

## Next Steps

- Read the full [README.md](README.md) for architecture details
- Customize game settings in `config.js`
- Modify `assets/css/styles.css` for UI changes
- Add new features in `classes/` and `client/components/`

## Support

Common issues:
- **Can't connect**: Check firewall settings
- **Lag**: Lower `UPDATE_RATE` in config
- **Physics feels off**: Adjust friction/restitution in Player.js and SoccerBall.js

## Production Deployment

For production:

1. Build optimized client:
```bash
NODE_ENV=production npm run build
```

2. Use process manager:
```bash
npm install -g pm2
pm2 start index-uws.js --name carsoccer
```

3. Configure reverse proxy (nginx):
```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

## Have Fun! 🎮⚽

Enjoy playing CarsOccer.io! Drive fast, boost smart, and score goals! 🚗💨
