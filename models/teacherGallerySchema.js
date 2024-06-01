const mongoose = require("mongoose");

const teacherGallerySchema = new mongoose.Schema({
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
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "teacher",
  },
});

module.exports = mongoose.model("teacherGallery", teacherGallerySchema);
