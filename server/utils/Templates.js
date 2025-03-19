function registrationEmailTemplate(name) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to DevProof</title>
        <style>
          body {
            font-family: 'Rubik', sans-serif;
            background-color: #0f0f0f;
            margin: 0;
            padding: 0;
            color: #ffffff;
          }
          .email-container {
            max-width: 600px;
            background: #1a1a1a;
            margin: 30px auto;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(255, 146, 17, 0.2);
            text-align: center;
            border: 1px solid #ff9211;
          }
          .logo {
            max-width: 120px;
            margin-bottom: 20px;
          }
          h2 {
            color: #ff9211;
            font-size: 24px;
            margin-bottom: 10px;
          }
          p {
            font-size: 16px;
            color: #cccccc;
            line-height: 1.6;
          }
          .highlight {
            background: linear-gradient(135deg, #ff9211, #e0820f);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            font-weight: bold;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #ff9211, #e0820f);
            color: #0f0f0f;
            font-size: 16px;
            padding: 12px 24px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
            margin: 20px 0;
            transition: all 0.3s ease-in-out;
          }
          .cta-button:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 15px rgba(255, 146, 17, 0.4);
          }
          hr {
            border: none;
            height: 1px;
            background: #ff9211;
            opacity: 0.3;
            margin: 25px 0;
          }
          .footer {
            font-size: 14px;
            color: #777777;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <img src="https://via.placeholder.com/120?text=DevProof" alt="DevProof Logo" class="logo">
          <h2>Welcome to <span class="highlight">DevProof!</span></h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>We're thrilled to have you join <span class="highlight">DevProof</span> — the platform rewarding open-source excellence on the Core Blockchain!</p>
          <p>Stake CORE tokens, contribute to GitHub, and earn rewards powered by AI-driven scoring. Your journey to recognition and earnings starts now!</p>
          <a href="https://dev-proof.vercel.app/" class="cta-button">Get Started</a>
          <p>Need help? Reach out to our support team anytime.</p>
          <p>Happy coding,</p>
          <p><strong>The DevProof Team</strong></p>
          <hr />
          <p class="footer">If you didn’t sign up, ignore this email. For support, contact <a href="mailto:support@devproof.ai">support@devproof.ai</a>.</p>
        </div>
      </body>
      </html>
    `;
  }
  
  function topContributorEmailTemplate(name) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Top 5 Contributor on DevProof</title>
        <style>
          body {
            font-family: 'Rubik', sans-serif;
            background-color: #0f0f0f;
            margin: 0;
            padding: 0;
            color: #ffffff;
          }
          .email-container {
            max-width: 600px;
            background: #1a1a1a;
            margin: 30px auto;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(255, 146, 17, 0.2);
            text-align: center;
            border: 1px solid #ff9211;
          }
          .logo {
            max-width: 120px;
            margin-bottom: 20px;
          }
          h2 {
            color: #ff9211;
            font-size: 24px;
            margin-bottom: 10px;
          }
          p {
            font-size: 16px;
            color: #cccccc;
            line-height: 1.6;
          }
          .highlight {
            background: linear-gradient(135deg, #ff9211, #e0820f);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            font-weight: bold;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #ff9211, #e0820f);
            color: #0f0f0f;
            font-size: 16px;
            padding: 12px 24px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
            margin: 20px 0;
            transition: all 0.3s ease-in-out;
          }
          .cta-button:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 15px rgba(255, 146, 17, 0.4);
          }
          hr {
            border: none;
            height: 1px;
            background: #ff9211;
            opacity: 0.3;
            margin: 25px 0;
          }
          .footer {
            font-size: 14px;
            color: #777777;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <img src="https://via.placeholder.com/120?text=DevProof" alt="DevProof Logo" class="logo">
          <h2>Congrats, <span class="highlight">${name}</span>!</h2>
          <p>Hello ${name},</p>
          <p>You’ve made it to the <span class="highlight">Top 5 Contributors</span> this week on <span class="highlight">DevProof</span>!</p>
          <p>Your outstanding contributions to open-source projects on the Core Blockchain have earned you a spot among the best. Check out the leaderboard to see your ranking and claim your rewards!</p>
          <a href="https://dev-proof.vercel.app/leaderboard" class="cta-button">View Leaderboard</a>
          <p>Keep coding and climbing the ranks!</p>
          <p>Best regards,</p>
          <p><strong>The DevProof Team</strong></p>
          <hr />
          <p class="footer">Questions? Contact us at <a href="mailto:support@devproof.ai">support@devproof.ai</a></p>
        </div>
      </body>
      </html>
    `;
  }
  
  function onboardingEmailTemplate(name, githubUsername) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome Onboard to DevProof</title>
        <style>
          body {
            font-family: 'Rubik', sans-serif;
            background-color: #0f0f0f;
            margin: 0;
            padding: 0;
            color: #ffffff;
          }
          .email-container {
            max-width: 600px;
            background: #1a1a1a;
            margin: 30px auto;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(255, 146, 17, 0.2);
            text-align: center;
            border: 1px solid #ff9211;
          }
          .logo {
            max-width: 120px;
            margin-bottom: 20px;
          }
          h2 {
            color: #ff9211;
            font-size: 24px;
            margin-bottom: 10px;
          }
          p {
            font-size: 16px;
            color: #cccccc;
            line-height: 1.6;
          }
          .highlight {
            background: linear-gradient(135deg, #ff9211, #e0820f);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            font-weight: bold;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #ff9211, #e0820f);
            color: #0f0f0f;
            font-size: 16px;
            padding: 12px 24px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
            margin: 20px 0;
            transition: all 0.3s ease-in-out;
          }
          .cta-button:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 15px rgba(255, 146, 17, 0.4);
          }
          .details-box {
            background: #252525;
            border-left: 4px solid #ff9211;
            padding: 15px;
            margin: 20px 0;
            text-align: left;
          }
          hr {
            border: none;
            height: 1px;
            background: #ff9211;
            opacity: 0.3;
            margin: 25px 0;
          }
          .footer {
            font-size: 14px;
            color: #777777;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <img src="https://via.placeholder.com/120?text=DevProof" alt="DevProof Logo" class="logo">
          <h2>Welcome Onboard to <span class="highlight">DevProof!</span></h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Welcome to <span class="highlight">DevProof</span> — where your open-source contributions on the Core Blockchain earn you rewards!</p>
          <div class="details-box">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>GitHub Username:</strong> ${githubUsername}</p>
          </div>
          <p>Your account is ready. Here’s how to get started:</p>
          <ul style="text-align: left; padding-left: 20px;">
            <li>Stake CORE tokens to join the reward ecosystem</li>
            <li>Contribute to GitHub projects</li>
            <li>Earn rewards based on AI-powered scoring</li>
            <li>Climb the weekly leaderboard</li>
          </ul>
          <a href="https://dev-proof.vercel.app/dashboard" class="cta-button">Go to Dashboard</a>
          <p>Questions? Our support team is here to help.</p>
          <p>Best regards,</p>
          <p><strong>The DevProof Team</strong></p>
          <hr />
          <p class="footer">For support, contact <a href="mailto:support@devproof.ai">support@devproof.ai</a>.</p>
        </div>
      </body>
      </html>
    `;
  }
  
  module.exports = {
    registrationEmailTemplate,
    topContributorEmailTemplate,
    onboardingEmailTemplate,
  };