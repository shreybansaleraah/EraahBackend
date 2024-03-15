const mongoose = require("mongoose");

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
  schoolName: {
    type: String,
    unique: false,
    required: true,
  },
});

module.exports = mongoose.model("NGO", NGOSchema);
