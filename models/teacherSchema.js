const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    aadhar: {
      type: String,
      required: false,
      default: "",
    },
    pan: {
      type: String,
      required: false,
      default: "",
    },
    photoUrl: {
      type: String,
      required: false,
      default: null,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "Teacher",
    },
    pgKey: {
      type: String,
      default: "",
      required: false,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NGO",
      required: true,
    },
    teachSubject: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "subject",
          required: true,
        },
      ],
    },
    classTeacher: {
      type: String,
      default: "NO",
    },
    teachSclass: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "sclass",
          required: true,
        },
      ],
    },
    attendance: {
      presentPercent: {
        type: Number,
        // required: true,
      },
      totalCount: {
        type: Number,
        // required: true,
      },
      presentCount: {
        type: Number,
      },
      absentCount: {
        type: Number,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("teacher", teacherSchema);
