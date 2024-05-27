const mongoose = require("mongoose");

const contactUsSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },

  ngoName: {
    type: String,
    required: true,
  },
  ngoAim: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },

  sections: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("contact", contactUsSchema);
