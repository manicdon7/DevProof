const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const sendEmail = require("./utils/SendEmail");
const {
  registrationEmailTemplate,
  eventCreationEmailTemplate,
  onboardingEmailTemplate,
} = require("./utils/Templates");

dotenv.config();

const app = express();
app.use(express.json());
const allowedOrigins = [
  'https://dev-proof.vercel.app',
  'http://localhost:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  const serverStatus = {
    status: "Server is running smoothly 🚀",
    uptime: process.uptime(),
    timestamp: new Date().toLocaleString(),
    message: "Welcome to the DevProof API — Rewarding Open Source Excellence on Core Blockchain! 🎉",
  };
  res.status(200).json(serverStatus);
});

// Route for sending registration emails
app.post("/api/send-registration-email", async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) {
      return res.status(400).json({ success: false, message: "Email and name are required" });
    }
    const subject = "Welcome to DevProof!";
    const htmlContent = registrationEmailTemplate(name);
    await sendEmail(email, subject, htmlContent);
    return res.status(200).json({ success: true, message: "Registration email sent successfully" });
  } catch (error) {
    console.error("Error sending registration email:", error);
    return res.status(500).json({ success: false, message: "Failed to send registration email", error: error.message });
  }
});

// Route for sending top contributor emails
app.post("/api/send-top-contributor-email", async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) {
      return res.status(400).json({ success: false, message: "Email and name are required" });
    }
    const subject = "Congrats! You're a Top 5 Contributor This Week!";
    const htmlContent = topContributorEmailTemplate(name);
    await sendEmail(email, subject, htmlContent);
    return res.status(200).json({ success: true, message: "Top contributor email sent successfully" });
  } catch (error) {
    console.error("Error sending top contributor email:", error);
    return res.status(500).json({ success: false, message: "Failed to send top contributor email", error: error.message });
  }
});

// Route for sending onboarding emails
app.post("/api/send-onboarding-email", async (req, res) => {
  try {
    const { email, name, githubUsername } = req.body;
    if (!email || !name || !githubUsername) {
      return res.status(400).json({ success: false, message: "Email, name, and GitHub username are required" });
    }
    const subject = "Welcome Onboard to DevProof!";
    const htmlContent = onboardingEmailTemplate(name, githubUsername);
    await sendEmail(email, subject, htmlContent);
    return res.status(200).json({ success: true, message: "Onboarding email sent successfully" });
  } catch (error) {
    console.error("Error sending onboarding email:", error);
    return res.status(500).json({ success: false, message: "Failed to send onboarding email", error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});