const mongoose = require("mongoose");

const leaderboardSchema = new mongoose.Schema({
  wallet: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
    min: 0,
  },
  timestamp: {
    type: Number,
    default: Date.now,
  },
});

const Board = mongoose.model("Board", leaderboardSchema);

module.exports = Board;
