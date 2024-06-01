const mongoose = require("mongoose");

const ngoGallerySchema = new mongoose.Schema({
  //   user: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "student",
  //     required: true,
  //   },
  //   date: {
  //     type: Date,
  //     required: true,
  //   },
  picUrl: {
    type: String,
    required: true,
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NGO",
    required: false,
  },
});

module.exports = mongoose.model("ngoGallery", ngoGallerySchema);
