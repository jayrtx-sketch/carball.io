# 🚗⚽ CarsOccer.io

A high-performance multiplayer car soccer game built with cutting-edge web technologies. Drive cars, boost around the field, and score goals in intense 5-minute matches!

## ✨ Features

- **High Performance**: Built with uWebSockets.js for lightning-fast networking
- **Realistic Physics**: Matter.js physics engine with optimized settings for satisfying gameplay
- **Beautiful Graphics**: PixiJS rendering with particle effects and smooth animations
- **Scalable**: Handles high player loads efficiently with optimized network and rendering
- **Real-time Multiplayer**: Up to 10 players per match with 30Hz update rate
- **Cross-platform**: Works on desktop and mobile with touch controls

## 🎮 Controls

### Desktop
- **Arrow Keys**: Move your car (up/down/left/right)
- **Space**: Boost
- **Mouse Mode**: Point your mouse to aim, arrow up to move forward

### Mobile
- **On-screen controls**: Touch buttons for movement and boost

## 🛠️ Technology Stack

### Server
- **uWebSockets.js**: Ultra-fast WebSocket server for real-time communication
- **Matter.js**: 2D physics engine for realistic car and ball physics
- **Node.js**: Runtime environment

### Client
- **PixiJS v7**: High-performance 2D rendering with WebGL
- **Custom Particle System**: Object-pooled particles for visual effects
- **WebSockets**: Real-time bidirectional communication
- **Webpack**: Module bundling and optimization

## 📦 Installation

```bash
# Install dependencies
npm install

# Build client assets
npm run build

# Start the server
npm start
```

## 🎯 Game Configuration

Edit `config.js` to customize game settings:

```javascript
{
  MATCH_LENGTH: 5,              // Match duration in minutes
  MIN_PLAYERS_FOR_MATCH: 4,     // Minimum players to start a match
  MAX_PLAYERS_PER_MATCH: 10,    // Maximum players per match
  PHYSICS_FPS: 60,              // Physics simulation rate
  UPDATE_RATE: 30,              // Network update rate (Hz)
  MAX_BALL_SPEED: 35,           // Maximum ball velocity
  MAX_PLAYER_SPEED: 25,         // Maximum car velocity
  BOOST_STRENGTH: 1.8,          // Boost multiplier
}
```

## 🏗️ Architecture

### Server Architecture
- **Game Loop**: 60 FPS physics updates with 30 FPS network updates
- **Matchmaking**: Automatic lobby system that creates games when enough players join
- **Game Management**: Multiple concurrent matches with automatic cleanup
- **Optimized Networking**: Compressed JSON packets with efficient serialization

### Client Architecture
- **Interpolation**: Smooth movement between server updates
- **Object Pooling**: Reused particle objects to prevent garbage collection
- **Camera System**: Smooth following camera with goal celebration zooms
- **Performance Monitoring**: Real-time speedometer and boost meter

### Physics Optimization
- **Collision Detection**: Optimized Matter.js settings (8 position iterations, 6 velocity iterations)
- **Speed Limiting**: Maximum velocities to maintain control and performance
- **Friction Tuning**: Carefully balanced air friction and restitution for satisfying feel
- **Inertia Adjustment**: Higher car inertia for realistic rotation

## 📊 Performance Characteristics

- **Network**: 30 updates/second per player
- **Physics**: 60 ticks/second server-side simulation
- **Rendering**: Adaptive frame rate (typically 60 FPS)
- **Particles**: Object-pooled system with up to 1000 particles
- **Latency Handling**: Client-side interpolation for smooth gameplay

## 🎨 Visual Effects

- **Boost Trails**: Colored particle trails when boosting
- **Goal Celebrations**: Explosive particle effects on scoring
- **Impact Effects**: Particles on ball collisions
- **Smooth Animations**: Score updates, countdown, goal notifications
- **Team Colors**: Blue and Red team distinction

## 🔧 Development

```bash
# Watch mode for development (auto-rebuild)
npm run watch

# Start server (legacy ws mode)
npm run start:legacy
```

## 📝 Project Structure

```
carsoccer.io/
├── assets/              # Static assets (images, CSS)
├── classes/             # Server-side game classes
│   ├── Game.js         # Main game logic and state management
│   ├── GameWorld.js    # Physics world configuration
│   ├── Player.js       # Player car physics and movement
│   ├── SoccerBall.js   # Ball physics
│   └── GoalPost.js     # Goal detection
├── client/              # Client-side code
│   ├── components/     # UI and game components
│   │   ├── ParticleSystem.js    # Particle effects
│   │   ├── PlayerObject.js      # Client player rendering
│   │   ├── SoccerBallObject.js  # Client ball rendering
│   │   └── ...
│   ├── main.js         # Entry point
│   └── startGame.js    # Game initialization
├── config.js           # Game configuration
├── index-uws.js        # uWebSockets.js server (production)
├── index.js            # Legacy ws server
└── package.json        # Dependencies
```

## 🚀 Deployment

For production deployment:

1. Build the client: `npm run build`
2. Start the server: `npm start`
3. Configure reverse proxy (nginx/caddy) for WebSocket support
4. Set appropriate environment variables for production

## 🎯 Game Mechanics

### Teams
- Players are automatically balanced into **Blue** and **Red** teams
- Teams try to score by hitting the ball into opponent's goal

### Boost System
- Limited boost meter (240 units)
- Boost increases speed by 1.8x
- Recharges automatically when not boosting

### Scoring
- Ball must enter the goal area
- Last team to touch the ball gets credit
- 5-minute matches with sudden death if tied (future feature)

### Physics Feel
- **Responsive**: Instant acceleration with smooth deceleration
- **Impactful**: High-mass collisions feel satisfying
- **Controllable**: Speed limits prevent chaos
- **Fair**: Balanced boost mechanics

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Additional power-ups
- Better mobile UI
- Sound effects and music
- Tournament mode
- Player statistics
- Custom car skins

## 📄 License

ISC License

## 🙏 Acknowledgments

- Matter.js for physics engine
- PixiJS for rendering
- uWebSockets.js for networking performance

---

**Made with ⚡ for high-performance multiplayer gaming**
