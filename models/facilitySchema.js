const mongoose = require("mongoose");

const facilitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: String,
      required: false,
    },
    price: {
      type: String,
      required: true,
    },
    proofOfDeployementUrl: {
      type: String,
      required: false,
      default: "",
    },
    // date: {
    //   type: Date,
    //   required: true,
    // },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NGO",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("facility", facilitySchema);
