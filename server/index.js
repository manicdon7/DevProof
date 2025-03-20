const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const sendEmail = require("./utils/SendEmail");
const {
  registrationEmailTemplate,
  topContributorEmailTemplate,
  onboardingEmailTemplate,
} = require("./utils/Templates");
const analyzeGithubIssues = require("./utils/classify");
const { getChatResponse } = require("./utils/coreMateUtils");
const bodyParser = require("body-parser");
const path = require("path");
const ConnectConfig = require("./lib/Connect.config");

dotenv.config();

const app = express();
app.use(express.json());
const allowedOrigins = [
  "https://dev-proof.vercel.app",
  "http://localhost:3000",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  const serverStatus = {
    status: "Server is running smoothly 🚀",
    uptime: process.uptime(),
    timestamp: new Date().toLocaleString(),
    message:
      "Welcome to the DevProof API — Rewarding Open Source Excellence on Core Blockchain! 🎉",
  };
  res.status(200).json(serverStatus);
});

app.post("/api/send-registration-email", async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) {
      return res
        .status(400)
        .json({ success: false, message: "Email and name are required" });
    }
    const subject = "Welcome to DevProof!";
    const htmlContent = registrationEmailTemplate(name);
    await sendEmail(email, subject, htmlContent);
    return res
      .status(200)
      .json({ success: true, message: "Registration email sent successfully" });
  } catch (error) {
    console.error("Error sending registration email:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send registration email",
      error: error.message,
    });
  }
});

// Route for sending top contributor emails
app.post("/api/send-top-contributor-email", async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) {
      return res
        .status(400)
        .json({ success: false, message: "Email and name are required" });
    }
    const subject = "Congrats! You're a Top 5 Contributor This Week!";
    const htmlContent = topContributorEmailTemplate(name);
    await sendEmail(email, subject, htmlContent);
    return res.status(200).json({
      success: true,
      message: "Top contributor email sent successfully",
    });
  } catch (error) {
    console.error("Error sending top contributor email:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send top contributor email",
      error: error.message,
    });
  }
});

// Route for sending onboarding emails
app.post("/api/send-onboarding-email", async (req, res) => {
  try {
    const { email, name, githubUsername } = req.body;
    if (!email || !name || !githubUsername) {
      return res.status(400).json({
        success: false,
        message: "Email, name, and GitHub username are required",
      });
    }
    const subject = "Welcome Onboard to DevProof!";
    const htmlContent = onboardingEmailTemplate(name, githubUsername);
    await sendEmail(email, subject, htmlContent);
    return res
      .status(200)
      .json({ success: true, message: "Onboarding email sent successfully" });
  } catch (error) {
    console.error("Error sending onboarding email:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send onboarding email",
      error: error.message,
    });
  }
});

app.post("/api/classify/v1", async (req, res) => {
  try {
    const { issues } = req.body;

    if (!issues || !Array.isArray(issues) || issues.length === 0) {
      return res.status(400).json({ error: "Invalid or empty issues array." });
    }

    const priority = await analyzeGithubIssues(issues);

    if (!priority) {
      return res.status(500).json({ error: "Failed to classify issues." });
    }

    return res.status(200).json({ priority });
  } catch (error) {
    console.error("Error in classify route:", error);
    return res
      .status(500)
      .json({ error: "Internal server error.", details: error.message });
  }
});

app.post("/api/coremate", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Message is required and must be a string",
      });
    }

    const response = await getChatResponse(message);

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error in CoreMate chat:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process CoreMate request",
      error: error.message,
    });
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "production" ? {} : err,
  });
});

app.post("/api/leaderboard", async (req, res) => {
  console.time("leaderboard-post");
  const { wallet, username, score } = req.body;

  if (!wallet || !username) {
    console.timeEnd("leaderboard-post");
    return res.status(400).json({ error: "Wallet and username are required." });
  }

  try {
    const db = await ConnectConfig();
    const collection = db.leaderboard;

    const existingRecord = await collection.findOne({ wallet });

    if (existingRecord) {
      console.timeEnd("leaderboard-post");
      return res.status(200).json({
        success: true,
        result: existingRecord,
      });
    }

    console.time("insertLeaderboardData");
    const leaderboardData = {
      wallet,
      username,
      score: score || 0,
      timestamp: new Date(),
    };

    const result = await collection.insertOne(leaderboardData, {
      maxTimeMS: 5000,
    });

    console.timeEnd("insertLeaderboardData");
    console.timeEnd("leaderboard-post");
    return res.status(201).json({ success: true, result });
  } catch (err) {
    console.error("Leaderboard insert error:", err);
    console.timeEnd("leaderboard-post");
    return res.status(500).json({
      error: "Error inserting leaderboard data",
      details: err.message,
    });
  }
});

app.get("/api/top-users", async (req, res) => {
  try {
    const db = await ConnectConfig();
    const collection = db.leaderboard;
    const topUsers = await collection
      .find()
      .sort({ score: -1 })
      .limit(5)
      .project({ wallet: 1, username: 1, score: 1, _id: 0 })
      .toArray(); 

    res.json({ success: true, users: topUsers });
  } catch (error) {
    console.error("Error fetching top users:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.post("/api/leaderboard/score", async (req, res) => {
  const { wallet, username, score } = req.body;
  const db = await ConnectConfig();
  const collection = db.leaderboard;

  if (!wallet || !username || score === undefined) {
    return res.status(400).json({
      message: "Wallet, username, and score are required.",
    });
  }

  try {
    const updatedUser = await collection.updateOne(
      { $or: [{ wallet }, { username }] },
      { $set: { score } },
      { new: true }
    );

    if (updatedUser.matchedCount === 0) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({
      message: "Score updated successfully",
      updatedUser,
    });
  } catch (error) {
    console.error("Error updating score:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
