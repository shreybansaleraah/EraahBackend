const donorInfoSchema = require("../models/donorInfoSchema");
const { APIResponse, MathUtil } = require("../utility");
const Teacher = require("../models/teacherSchema.js");
const otpModel = require("../models/otpModel.js");

const donorRegister = (req, res) => {
  // console.log("Donor registeration start");
  donorInfoSchema
    .create(req.body)
    .then((value) => {
      APIResponse.success(res, "Successfully donor added", value);
    })
    .catch((err) => {
      APIResponse.badRequest(res, err, {});
    });
};
const donorUpdate = (req, res) => {
  donorInfoSchema
    .findByIdAndUpdate(req.query.id, req.body)
    .then((value) => {
      APIResponse.success(res, "Successfully donor updated", {});
    })
    .catch((err) => {
      APIResponse.badRequest(res, err, {});
    });
};
const donorDelete = (req, res) => {
  donorInfoSchema
    .findByIdAndDelete(req.query.id)
    .then((value) => {
      APIResponse.success(res, "Successfully donor deleted", {});
    })
    .catch((err) => {
      APIResponse.badRequest(res, err, {});
    });
};
const getDonorInfo = (req, res) => {
  donorInfoSchema
    .findById(req.query.id)
    .then((donor) => {
      // console.log("donor");
      // console.log(donor);
      if (donor) {
        APIResponse.success(res, "success", donor);
      } else {
        APIResponse.notFound(res, "no user found", {});
      }
    })
    .catch((err) => {
      APIResponse.badRequest(res, err, {});
    });
};
const getDonorTeachers = (req, res) => {
  donorInfoSchema
    .findById(req.query.id)
    .then((donor) => {
      // console.log("donor");
      // console.log(donor);
      if (donor) {
        Teacher.find({})
          .populate({ path: "school", select: "-password" })
          .populate("teachSubject", "subName")
          .populate("teachSclass", "sclassName")
          .then((teachers) => {
            if (teachers.length > 0) {
              let modifiedTeachers = teachers.map((teacher) => {
                return { ...teacher._doc, password: undefined };
              });
              APIResponse.success(res, "success", modifiedTeachers);
            } else {
              APIResponse.success(res, "success", []);
            }
          })
          .catch((err) => {
            APIResponse.badRequest(res, err, {});
          });
      } else {
        APIResponse.unAuthorized(res, "unauthorized");
      }
    })
    .catch((err) => {
      APIResponse.badRequest(res, err, {});
    });
};
const generateOtp = (req, res) => {
  // logger.info("Generate OTP Service Start");
  const body = req.body;
  // console.log(body);
  // // console.log(body);
  var pin = MathUtil.getOTP();
  // console.log(pin);
  // logger.debug("generated pin is %o", pin);
  // logger.debug("body is %o ", body);

  donorInfoSchema
    .findOne({ phoneNumber: body.phone })
    .then((donorExist) => {
      if (donorExist) {
        otpModel
          .deleteMany({
            phone: body.phone,
          })
          .then((delRes) => {
            // console.log("deleted");
            otpModel
              .create({
                phone: body.phone,
                //   otp: pin,
                otp: "9999",
              })
              .then((value) => {
                // logger.debug("created success %o", value);
                // logger.info("generated otp success");
                //   sendMail("your foeVideos account OTP", pin, body.emailId);
                // return value;
                APIResponse.success(res, `otp sent to ${body.phone}`, {});
              })
              .catch((e) => {
                // logger.debug("error in %o ", e);
                // logger.error(e);
                // console.log(e);
                APIResponse.badRequest(res, "something went wrong", {});
              });

            // })
          })
          .catch((e) => {
            // console.log(e);
            APIResponse.badRequest(res, "something went wrong", {});
          });
      } else {
        APIResponse.notFound(res, "user does not exist", {});
      }
    })
    .catch((e) => {
      APIResponse.badRequest(res, "something went wrong", {});
    });
};

const verifyDonorOtp = (req, res) => {
  otpModel
    .findOneAndDelete(req.body)
    .then((value) => {
      if (value) {
        donorInfoSchema
          .findOne({ phoneNumber: req.body.phone })
          .then((donorInfo) => {
            APIResponse.success(res, "otp verified", donorInfo);
          });
      } else {
        APIResponse.notFound(res, "Invalid Otp", {});
      }
    })
    .catch((e) => {
      // console.log(e);
      APIResponse.badRequest(res, "something went wrong", {});
    });
};

module.exports = {
  donorRegister,
  donorUpdate,
  donorDelete,
  getDonorTeachers,
  generateOtp,
  verifyDonorOtp,
  getDonorInfo,
};
