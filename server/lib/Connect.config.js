const { MongoClient } = require("mongodb");
require("dotenv").config();

const Uri = process.env.AI_MODEL;
const Client = new MongoClient(Uri);
let db;
let connectionPromise;

// Create a function that returns a promise for the connection
async function connect() {
  if (connectionPromise) return connectionPromise;

  connectionPromise = new Promise(async (resolve, reject) => {
    try {
      console.log(
        "Connecting to MongoDB with URI:",
        Uri ? "URI exists" : "URI is missing"
      );
      await Client.connect();
      db = Client.db("devProof");
      await db.collection("Board").createIndex({ wallet: 1 });
      console.log("Connected to MongoDB successfully");
      resolve(db);
    } catch (err) {
      console.error("MongoDB connection failed:", err);
      reject(err);
    }
  });

  return connectionPromise;
}

connect().catch((err) =>
  console.error("Initial connection attempt failed:", err)
);

module.exports = async function ConnectConfig() {
  if (!db) {
    try {
      await connect();
    } catch (err) {
      throw new Error(`Database not connected: ${err.message}`);
    }
  }
  return { leaderboard: db.collection("Board") };
};
