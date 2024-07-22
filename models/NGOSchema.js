const mongoose = require("mongoose");
const bankDetails = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: null,
  },
  accountNumber: {
    type: String,
    required: true,
    default: null,
  },
  ifsc: {
    type: String,
    required: true,
    default: null,
  },
  bankName: {
    type: String,
    required: true,
    default: null,
  },
  branchName: {
    type: String,
    required: true,
    default: null,
  },
});

const NGOSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: false,
  },

  address: {
    type: String,
    unique: false,
    required: true,
  },
  founderName: {
    type: String,
    unique: false,
    required: true,
  },
  founderPan: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
  pan: {
    type: String,
    required: false,
  },

  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "NGO",
  },
  mobile: {
    type: String,
    default: "",
    required: true,
  },
  addUrl: {
    type: String,
    unique: false,
    required: false,
    default: "left to upload",
  },
  bankUrl: {
    type: String,
    unique: false,
    required: false,
    default: "left to upload",
  },
  trustee: {
    type: String,
    unique: false,
    required: true,
  },
  pgKey: {
    type: String,
    unique: true,
    required: true,
    default: "",
  },
  schoolName: {
    type: String,
    unique: false,
    required: true,
  },
  city: {
    type: String,
    unique: false,
    required: true,
  },
  state: {
    type: String,
    unique: false,
    required: true,
  },
  bankDetails: {
    type: bankDetails,
    required: true,
    default: null,
  },
  eraahCharges: {
    type: String,
    required: true,
    default: "6",
  },
});

module.exports = mongoose.model("NGO", NGOSchema);
