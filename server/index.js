const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const sendEmail = require("./utils/SendEmail");
const {
  registrationEmailTemplate,
  topContributorEmailTemplate,
  onboardingEmailTemplate,
} = require("./utils/Templates");
const analyzeGithubIssues = require("./utils/classify");
const { getChatResponse } = require("./utils/coreMateUtils");
const Board = require("./lib/schema/index"); // Import the Board model
const Bounty = require("./lib/schema/Bounty");

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
    if (allowedOrigins.includes(origin)) {
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

// MongoDB Connection
mongoose
  .connect(process.env.URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err.message));

// Root Route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "Server is running smoothly 🚀",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    message: "Welcome to the DevProof API 🎉",
  });
});

// Email Routes
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

// Check User Route (Corrected - Removed ConnectConfig)
app.get("/api/checkUser", async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({
      success: false,
      message: "Username query parameter is required",
    });
  }

  try {
    const user = await Board.findOne({ username });

    if (user) {
      return res.status(200).json({
        success: true,
        isConnected: true,
        message: `User ${username} found in the database`,
      });
    } else {
      return res.status(200).json({
        success: true,
        isConnected: false,
        message: `User ${username} not found in the database`,
      });
    }
  } catch (error) {
    console.error("Error in /api/checkUser:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check user - database connection issue",
      error: error.message,
    });
  }
});

// Classify Issues Route
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

// CoreMate Chat Route
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

// Health Check Route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Leaderboard Routes
app.post("/api/leaderboard", async (req, res) => {
  try {
    const { wallet, username, score } = req.body;
    if (!wallet || !username) {
      return res
        .status(400)
        .json({ error: "Wallet and username are required." });
    }

    let user = await Board.findOne({ wallet });
    if (!user) {
      user = new Board({ wallet, username, score: score || 0 });
      await user.save();
    } else {
      // Update existing user if needed (optional)
      user.score = score || user.score;
      await user.save();
    }

    res.status(200).json({ success: true, result: user });
  } catch (err) {
    console.error("Leaderboard insert error:", err);
    res.status(500).json({
      error: "Error inserting leaderboard data",
      details: err.message,
    });
  }
});

app.get("/api/top-users", async (req, res) => {
  try {
    const users = await Board.find()
      .sort({ score: -1 }) // Sort by score descending
      .select("wallet username score -_id") // Select only needed fields, exclude _id
      .limit(10); // Limit to top 10 users (adjust as needed)

    res.json({ success: true, users, top5: users.slice(0, 5) });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.post("/api/leaderboard/score", async (req, res) => {
  try {
    const { wallet, username, score } = req.body;
    if (!wallet || !username || score === undefined) {
      return res
        .status(400)
        .json({ message: "Wallet, username, and score are required." });
    }

    const updatedUser = await Board.findOneAndUpdate(
      { $or: [{ wallet }, { username }] },
      { $set: { score, username, wallet } }, // Ensure all fields are updated
      { new: true, upsert: true } // Return updated doc, create if not exists
    );

    res
      .status(200)
      .json({ message: "Score updated successfully", updatedUser });
  } catch (error) {
    console.error("Error updating score:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/api/bounty", async (req, res) => {
  try {
    const { taskname, walletAddress, contractAddress, abi } = req.body;
    if (!walletAddress || !contractAddress || !abi || !taskname) {
      return res.status(400).json({
        message: "Wallet address, contract address, and ABI are required.",
      });
    }

    const bounty = await Bounty.findOneAndUpdate(
      { walletAddress },
      { $set: { contractAddress, abi, taskname } },
      { new: true, upsert: true }
    );

    res
      .status(200)
      .json({ message: "Bounty details stored successfully", bounty });
  } catch (error) {
    console.error("Error storing bounty details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "production" ? {} : err.message,
  });
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
