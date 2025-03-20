const ConnectConfig = require("../lib/Connect.config");

async function insertLeaderboardData(wallet, username, score = 0) {
  try {
    const db = await ConnectConfig();
    const collection = db.leaderboard;
    const leaderboardData = {
      wallet,
      username,
      score,
      timestamp: new Date(),
    };

    const result = await collection.insertOne(leaderboardData, {
      maxTimeMS: 5000,
    }); 
    return result;
  } catch (err) {
    console.error("Error inserting leaderboard data:", err);
    throw err; 
  }
}

module.exports = insertLeaderboardData;
