const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true, // Changed to true for port 465 (SSL)
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

async function sendEmail(to, subject, html, cc) {
  const mailOptions = {
    from: process.env.EMAIL,
    to: to,
    cc: cc,
    subject: subject,
    html: html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error; // Re-throw to handle in the caller
  }
}

module.exports = sendEmail;