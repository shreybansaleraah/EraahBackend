const mongoose = require("mongoose");

const teacherAttendenceSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      default: false,
      require: true,
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

module.exports = mongoose.model("teacherAttendence", teacherAttendenceSchema);
