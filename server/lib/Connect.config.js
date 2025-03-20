const { MongoClient } = require("mongodb");
require("dotenv").config();

const Uri = process.env.AI_MODEL;
const Client = new MongoClient(Uri);
let db;

(async () => {
  try {
    await Client.connect();
    db = Client.db("devProof");
    await db.collection("Board").createIndex({ wallet: 1 });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
  }
})();

module.exports = async function ConnectConfig() {
  if (!db) {
    throw new Error("Database not connected");
  }
  return { leaderboard: db.collection("Board") };
};
