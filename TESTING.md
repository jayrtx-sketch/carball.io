# 🧪 Testing Guide - CarsOccer.io

## Quick Test

```bash
# 1. Install and build (if not done)
npm install && npm run build

# 2. Start server
npm start

# 3. Open browser to http://localhost:3000

# 4. Open multiple tabs to test multiplayer
```

## Testing Scenarios

### ✅ Basic Functionality

#### Single Player (Lobby Test)
1. Open http://localhost:3000
2. Enter name "TestPlayer1"
3. Click "Play"
4. **Expected**: Join lobby, see field, can move around
5. **Expected**: Timer shows "Waiting for match..."
6. **Expected**: Ball is hidden off-screen

#### Multiple Players (Match Test)
1. Open 4 browser tabs/windows
2. Join with different names in each
3. **Expected**: After 4 players join, match starts automatically
4. **Expected**: 3-2-1 countdown appears
5. **Expected**: Players split into Blue and Red teams
6. **Expected**: Ball appears in center
7. **Expected**: 5:00 timer starts counting down

### ⚽ Gameplay Testing

#### Movement Controls
**Keyboard Mode:**
- Press ↑: Car moves forward
- Press ↓: Car moves backward  
- Press ←: Car turns left
- Press →: Car turns right
- Press Space: Boost activates (bar depletes)
- **Expected**: Smooth, responsive movement

**Mouse Mode:**
- Move mouse: Car aims at cursor
- Press ↑: Car moves forward
- Press Space: Boost
- **Expected**: Car rotates to face mouse

#### Boost System
1. Hold Space to boost
2. **Expected**: 
   - Speed increases noticeably
   - Boost bar depletes (turns black)
   - Particles trail behind car in team color
3. Release Space
4. **Expected**: 
   - Boost bar recharges gradually
   - Speed returns to normal
   - Particles stop

#### Ball Physics
1. Drive into ball
2. **Expected**:
   - Ball moves based on impact force
   - Ball bounces off walls
   - Ball slows down gradually
3. Multiple players hit ball
4. **Expected**:
   - Ball responds to each impact
   - Momentum is realistic

#### Goal Scoring
1. Hit ball into opponent's goal
2. **Expected**:
   - Score updates (e.g., 1-0)
   - Goal notification slides in with scorer name
   - Particle explosion at goal
   - Camera pans to ball briefly
   - Ball resets to center after 5 seconds
   - Players respawn at starting positions

### 🎨 Visual Effects Testing

#### Particle Effects
1. **Boost Particles**:
   - Boost while moving
   - **Expected**: Team-colored particles trail behind
2. **Goal Particles**:
   - Score a goal
   - **Expected**: ~30 particles explode from goal
3. **Performance**:
   - Multiple players boosting simultaneously
   - **Expected**: No lag, smooth 60 FPS

#### Animations
1. **Title**: Should pulse continuously on home screen
2. **Countdown**: Numbers should grow/shrink with color change
3. **Goal Notification**: Should slide in from left, glow effect
4. **Score Display**: Should have glassmorphism backdrop
5. **Boost Bar**: Should smoothly animate fill/deplete

### 📱 Mobile Testing

#### Auto-Detection
1. Open on mobile device or use browser dev tools mobile mode
2. **Expected**: Touch controls appear automatically
3. **Expected**: Controls overlay game area

#### Touch Controls
1. Tap UP button: Car moves forward
2. Tap LEFT/RIGHT: Car turns
3. Tap BOOST: Boost activates
4. **Expected**: All controls responsive
5. **Expected**: No accidental taps

### 🔌 Connection Testing

#### Normal Connection
1. Join game
2. **Expected**: "Connected to server!" in console
3. **Expected**: Socket ID received
4. **Expected**: Can join match

#### Disconnection
1. Join match
2. Close browser tab
3. **Expected**: Server logs disconnection
4. **Expected**: Player removed from match
5. **Expected**: Other players see player disappear

#### Reconnection
1. Join match
2. Disable network briefly
3. Re-enable network
4. **Expected**: Auto-reconnect (may need page refresh)

### ⚡ Performance Testing

#### Single Match Load
1. Start match with 10 players (10 tabs)
2. All players boost continuously
3. **Expected**:
   - Client FPS stays at ~60
   - Server CPU < 10%
   - No lag or stuttering
   - Particles render smoothly

#### Multiple Match Load
1. Create 20 matches (20 * 4 = 80 players minimum)
2. Monitor server resources
3. **Expected**:
   - Server handles all matches
   - No crashes
   - CPU < 50%
   - Memory < 2GB

#### Network Load
1. Monitor browser Network tab
2. Play for 1 minute
3. **Expected**:
   - ~10 KB/s per player
   - No packet loss warnings
   - Smooth gameplay

### 🎯 Edge Case Testing

#### Empty Lobby
- Join lobby alone
- Wait 60 seconds
- **Expected**: Stays in lobby, doesn't create match

#### Insufficient Players
- Join with 3 players
- Wait for match timeout (60 seconds)
- **Expected**: Match may not start (needs 4)

#### Maximum Players
- Fill match to 10 players
- Try to join 11th player
- **Expected**: 11th goes to lobby or new match

#### Long Names
- Enter name with 50 characters
- **Expected**: Truncated to 20 characters

#### Empty Name
- Click Play without entering name
- **Expected**: Assigned "Car" as default name

#### Special Characters
- Try name with HTML: `<script>alert(1)</script>`
- **Expected**: Rendered as text, no XSS

#### Rapid Boost Spam
- Spam Space key rapidly
- **Expected**: Boost toggles correctly, no bugs

#### Wall Collision
- Drive into wall at max speed
- **Expected**: Bounce off cleanly, no glitches

### 🐛 Bug Detection Checklist

#### Client Bugs
- [ ] Particles don't disappear (memory leak)
- [ ] FPS drops over time (GC issue)
- [ ] Players teleport (interpolation bug)
- [ ] Ball passes through goals (collision bug)
- [ ] Boost bar doesn't refill
- [ ] Score doesn't update
- [ ] Timer shows negative time

#### Server Bugs
- [ ] Matches don't start
- [ ] Players stuck in lobby
- [ ] Disconnects cause crashes
- [ ] Memory leaks over time
- [ ] CPU spikes unexpectedly
- [ ] Goals not detected
- [ ] Ball gets stuck

#### Network Bugs
- [ ] Connection drops randomly
- [ ] High latency causes glitches
- [ ] Packet loss visible
- [ ] Bandwidth usage spikes
- [ ] WebSocket upgrade fails

## Performance Benchmarks

### Target Metrics
| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| Client FPS | 60 | 45+ | <30 |
| Server CPU/Match | 5% | 10% | >15% |
| Memory/Match | 50MB | 100MB | >200MB |
| Latency | <50ms | <100ms | >200ms |
| Load Time | <2s | <5s | >10s |
| Packet Size | ~200B | ~500B | >1KB |

### How to Measure

#### Client FPS
```javascript
// In browser console:
let fps = 0;
let lastTime = performance.now();
function measureFPS() {
    let now = performance.now();
    fps = Math.round(1000 / (now - lastTime));
    lastTime = now;
    console.log('FPS:', fps);
    requestAnimationFrame(measureFPS);
}
measureFPS();
```

#### Server CPU
```bash
# Monitor server process
top -p $(pgrep -f "node index-uws")

# Or use htop for better visualization
htop -p $(pgrep -f "node index-uws")
```

#### Memory Usage
```bash
# Check memory
ps aux | grep node

# Detailed memory info
node --expose-gc index-uws.js
# Then in another terminal:
kill -USR2 $(pgrep -f "node index-uws")
```

#### Network Latency
- Open browser DevTools → Network tab
- Filter: WS (WebSocket)
- Check "Time" column for latency

## Automated Testing

### Unit Tests (Future)
```bash
npm test
```

### Load Testing (Future)
```bash
# Using artillery
npm install -g artillery
artillery quick --count 100 --num 10 ws://localhost:3000
```

## Test Results Log

### Date: YYYY-MM-DD
**Tester**: [Name]
**Branch**: main/develop
**Build**: [hash/version]

#### Passed Tests
- [ ] Single player lobby
- [ ] 4 player match start
- [ ] 10 player full match
- [ ] Boost mechanics
- [ ] Goal scoring
- [ ] Particle effects
- [ ] Mobile controls
- [ ] Reconnection
- [ ] Performance (60 FPS)
- [ ] Multiple concurrent matches

#### Failed Tests
- [ ] [Issue description]

#### Performance Results
- Client FPS: ____ avg
- Server CPU: ____% per match
- Memory: ____ MB per match
- Latency: ____ ms

#### Notes
```
[Any observations, issues, or suggestions]
```

## Debugging Tips

### Client Issues
```javascript
// Enable verbose logging
localStorage.debug = 'carsoccer:*';

// Check particle count
console.log(particleSystem.activeParticles.length);

// Monitor FPS
app.ticker.FPS
```

### Server Issues
```javascript
// Add logging
console.log('Game state:', Games);
console.log('Active sockets:', sockets.size);
console.log('Players in match:', Object.keys(game.players));
```

### Network Issues
- Chrome DevTools → Network → WS
- Check message frequency
- Verify packet size
- Monitor for errors

## Common Issues & Solutions

### Issue: uWebSockets.js won't install
**Solution**: Install build tools or use legacy server
```bash
npm run start:legacy
```

### Issue: Client shows blank screen
**Solution**: Check browser console for errors, rebuild
```bash
npm run build
```

### Issue: Match won't start
**Solution**: Need minimum 4 players, check player count

### Issue: High CPU usage
**Solution**: Check number of matches, reduce max concurrent

### Issue: Lag/stuttering
**Solution**: 
- Check network latency
- Reduce particle count
- Lower update rate in config

### Issue: Ball stuck in goal
**Solution**: Restart match, check goal collision code

## Quality Checklist

Before deploying:
- [ ] All basic tests pass
- [ ] No console errors
- [ ] 60 FPS maintained
- [ ] Memory stable over 30 min
- [ ] CPU acceptable under load
- [ ] Mobile works properly
- [ ] No obvious bugs
- [ ] Documentation updated
- [ ] Config reviewed
- [ ] Build successful

## Conclusion

Regular testing ensures:
- ✅ Game is playable
- ✅ Performance is good
- ✅ Bugs are caught early
- ✅ Quality is maintained
- ✅ Players have fun!

---

**Test thoroughly, deploy confidently!** 🧪✨
