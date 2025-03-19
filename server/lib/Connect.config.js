const { MongoClient } = require("mongodb");
require("dotenv").config();

const Uri = process.env.AI_MODEL;

const Client = new MongoClient(Uri);
let isConnected = false;

module.exports = async function Connect() {
  try {
    if (!isConnected) {
      await Client.connect();
      isConnected = true;
      console.log("Connected to MongoDB");
    }
    const db = Client.db("devProof");
    const leaderboard = db.collection("Board");
    return { leaderboard };
  } catch (err) {
    console.error("Database connection failed:", err);
    throw new Error("invalid url provided");
  }
};
