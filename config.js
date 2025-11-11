module.exports = {
  MIN_MATCH_WAITTIME: 6000, //THIS IS IN SECONDS 
  MATCH_LENGTH: 5, //IN MINUTES
  MAX_MATCHES: 10,
  BOOST_STRENGTH: 1.5, //multiplier to max velocity
  DEFAULT_NAME: "Car",
  TICK_RATE: 60, // Server tick rate
  UPDATE_RATE: 30 // Update packet rate (half of tick rate for bandwidth optimization)
}