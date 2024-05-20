const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    entryFee: {
      type: String,
      required: false,
      default: "free",
    },
    date: {
      type: Date,
      required: true,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NGO",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("notice", noticeSchema);
