const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    photoUrl: {
      type: String,
      required: false,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("blog", blogSchema);
