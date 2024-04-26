const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    subName: {
      type: String,
      required: true,
    },
    subCode: {
      type: String,
      required: false,
      default: null,
    },
    sessions: {
      type: String,
      required: false,
      default: null,
    },
    sclassName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sclass",
      required: true,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NGO",
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teacher",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("subject", subjectSchema);
