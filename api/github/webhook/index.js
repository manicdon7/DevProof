const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  const event = req.headers["x-github-event"]; 
  const payload = req.body;

  console.log(`📩 Received GitHub event: ${event}`);

  switch (event) {
    case "push":
      console.log("👨‍💻 New commit by:", payload.pusher.name);
      console.log("📌 Commit message:", payload.head_commit.message);
      break;

    case "pull_request":
      console.log("🔀 PR Action:", payload.action);
      console.log("📄 PR Title:", payload.pull_request.title);
      console.log("👨‍💻 Opened by:", payload.pull_request.user.login);
      break;

    case "issues":
      console.log("🐛 Issue:", payload.issue.title);
      console.log("⚡ Status:", payload.action);
      console.log("👨‍💻 Reported by:", payload.issue.user.login);
      break;

    default:
      console.log("ℹ️ Unhandled event:", event);
  }

  res.status(200).send("Webhook received! 🎉");
});

module.exports = router;
