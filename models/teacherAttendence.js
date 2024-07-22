const mongoose = require("mongoose");

const teacherAttendenceSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      default: "absent",
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
    date: {
      type: Date,
      default: Date.now,
      // Set a function to extract only the date part
      get: function (date) {
        return date.toISOString().split("T")[0];
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("teacherAttendence", teacherAttendenceSchema);
