const express = require("express");
const bodyParser = require("body-parser");
const webhookRoute = require("./github/webhook/index");

const app = express();
const PORT = 4000;

app.use(bodyParser.json());
app.use("/webhook", webhookRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
