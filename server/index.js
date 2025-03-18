const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT || 5000;
// const dbURI = process.env.MONGODBURI;




app.get("/", (req, res) => {
  const serverStatus = {
    status: "Server is running smoothly 🚀",
    uptime: process.uptime(),
    timestamp: new Date().toLocaleString(),
    message: "Welcome to the NEXT-STEP career guidance Platform API 🎉",
  };

  res.status(200).json(serverStatus);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});