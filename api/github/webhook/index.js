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
      console.log(
        "🌿 Pushed to branch:",
        payload.ref.replace("refs/heads/", "")
      );
      payload.commits.forEach((commit, index) => {
        console.log(
          `📝 Commit #${index + 1}: ${commit.message} (by ${
            commit.author.name
          })`
        );
      });

      break;

    case "pull_request":
      console.log("🔀 PR Action:", payload.action);
      console.log("📄 PR Title:", payload.pull_request.title);
      console.log("👨‍💻 Opened by:", payload.pull_request.user.login);
      console.log("🌿 PR Target Branch:", payload.pull_request.base.ref);
      console.log("🌱 PR Source Branch:", payload.pull_request.head.ref);

      // Check if the PR is merged
      if (payload.action === "closed" && payload.pull_request.merged) {
        console.log("✅ PR Merged!");
      } else if (payload.action === "closed") {
        console.log("❌ PR Closed without merging.");
      }
      break;

    case "create":
      if (payload.ref_type === "branch") {
        console.log(`🌱 New branch created: ${payload.ref}`);
      }
      break;

    case "delete":
      if (payload.ref_type === "branch") {
        console.log(`🗑️ Branch deleted: ${payload.ref}`);
      }
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
