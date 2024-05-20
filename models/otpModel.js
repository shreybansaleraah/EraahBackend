const mongoose = require("mongoose");

const OTPModel = new mongoose.Schema({
  // name: {
  //   type: String,
  //   required: false,
  // },
  email: {
    type: String,
    required: true,
  },
  // newEmail: {
  //   type: String,
  //   required: false,
  // },
  // upEmail: {
  //   type: Boolean,
  //   required: false,
  //   default: false,
  // },
  otp: {
    type: String,
    required: true,
  },
  createdAt: { type: Date, expires: 600, default: Date.now }, // expires in 10 min

  //   otpExprAt: {
  //     type: Number,
  //     alias: "otpExpireAt",
  //     default: Date.now() + 1000 * 10,
  //   },
  // },
  // { timestamps: { createdAt: "crt_at", updatedAt: "upt_at" }
});

module.exports = mongoose.model("OTP", OTPModel);
