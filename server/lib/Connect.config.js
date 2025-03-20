// const { MongoClient } = require("mongodb");
// require("dotenv").config();

// const Uri = process.env.AI_MODEL;
// const Client = new MongoClient(Uri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
// let db;
// let connectionPromise;

// async function connect() {
//   if (connectionPromise) return connectionPromise;

//   connectionPromise = new Promise(async (resolve, reject) => {
//     try {
//       if (!Uri) {
//         throw new Error("MONGODB_URI environment variable is not set");
//       }
//       console.log("Connecting to MongoDB with URI:", Uri.slice(0, 20) + "..."); // Log partial URI for security
//       await Client.connect();
//       db = Client.db("devProof");
//       await db.collection("Board").createIndex({ wallet: 1 });
//       console.log("Connected to MongoDB successfully");
//       resolve(db);
//     } catch (err) {
//       console.error("MongoDB connection failed:", err);
//       reject(err);
//     }
//   });

//   return connectionPromise;
// }

// // Initial connection attempt
// connect().catch((err) =>
//   console.error("Initial connection attempt failed:", err)
// );

// module.exports = async function ConnectConfig() {
//   if (!db) {
//     try {
//       await connect();
//     } catch (err) {
//       throw new Error(`Database connection failed: ${err.message}`);
//     }
//   }
//   if (!db) {
//     throw new Error(
//       "Database object is still undefined after connection attempt"
//     );
//   }
//   return { leaderboard: db.collection("Board") };
// };
