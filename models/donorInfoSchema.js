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

const location = new mongoose.Schema({
  place: {
    type: String,
    required: false,
    default: null,
  },
  city: {
    type: String,
    required: false,
    default: null,
  },
  state: {
    type: String,
    required: false,
    default: null,
  },
});

const donorInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: null,
  },
  phoneNumber: {
    type: String,
    unique: true,
    required: true,
    default: null,
  },
  email: {
    type: String,
    required: true,
    default: null,
  },
  pan: {
    type: String,
    required: true,
    default: null,
  },
  aadhar: {
    type: String,
    required: true,
    default: null,
  },
  gender: {
    type: String,
    required: false,
    default: null,
  },
  age: {
    type: String,
    required: false,
    default: null,
  },
  bankDetails: {
    type: bankDetails,
    required: true,
    default: null,
  },
  address: {
    type: location,
    // required: f,
    // default: null,
  },
});

module.exports = mongoose.model("donorInfo", donorInfoSchema);
