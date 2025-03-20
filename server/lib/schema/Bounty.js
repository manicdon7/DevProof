const mongoose = require("mongoose");

const BountySchema = new mongoose.Schema({
  walletAdress: { type: String, required: true, unique: true },
  contractAddress: { type: String, required: true },
  abi: { type: Object, required: true } // ABI stored as JSON
});

const Bounty = mongoose.model("bounty", BountySchema);
module.exports = Bounty;
