const donorInfoSchema = require("../models/donorInfoSchema");
const { APIResponse, MathUtil } = require("../utility");
const Teacher = require("../models/teacherSchema.js");
const otpModel = require("../models/otpModel.js");
const AdminModel = require("../models/adminSchema.js");
const { sendMail } = require("../utility/index.js");
const crypto = require("crypto");
const donationSchema = require("../models/donationSchema.js");
const NGOSchema = require("../models/NGOSchema.js");
const teacherSchema = require("../models/teacherSchema.js");
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
const getAllDonors = (req, res) => {
  AdminModel.findById(req.query.id)
    .then((value) => {
      console.log("value");
      console.log(value);
      if (value) {
        donorInfoSchema
          .find({})
          .then((donor) => {
            if (donor) {
              APIResponse.success(res, "success", donor);
            } else {
              APIResponse.notFound(res, "no donor found", {});
            }
          })
          .catch((err) => {
            APIResponse.badRequest(res, err, {});
          });
      } else {
        APIResponse.unAuthorized(res, e, {});
      }
    })
    .catch((e) => {
      APIResponse.badRequest(res, e, {});
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
const getNgoTeachers = (req, res) => {
  donorInfoSchema
    .findById(req.query.id)
    .then((donor) => {
      // console.log("donor");
      // console.log(donor);
      if (donor) {
        Teacher.find({ school: req.query.ngoId })
          .select("-password")
          .populate({ path: "school", select: "-password" })
          .populate("teachSubject", "subName")
          .populate("teachSclass", "sclassName")
          .then((teachers) => {
            APIResponse.success(res, "success", teachers);
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
const getNgoDetails = (req, res) => {
  donorInfoSchema
    .findById(req.query.id)
    .then((donor) => {
      // console.log("donor");
      // console.log(donor);
      if (donor) {
        NGOSchema.findById(req.query.ngoId)
          .select("-password")
          .then((teachers) => {
            APIResponse.success(res, "success", teachers);
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
    .findOne({ email: body.email })
    .then((donorExist) => {
      if (donorExist) {
        otpModel
          .deleteMany({
            email: body.email,
          })
          .then((delRes) => {
            // console.log("deleted");
            otpModel
              .create({
                email: body.email,
                otp: body.email === "donor@gmail.com" ? "9999" : pin,
                // otp: "9999",
              })
              .then((value) => {
                // logger.debug("created success %o", value);
                // logger.info("generated otp success");
                console.log(value);
                if (body.email !== "donor@gmail.com") {
                  sendMail.sendMail(
                    "your Eraah donor login account OTP",
                    pin,
                    body.email
                  );
                }
                // return value;
                APIResponse.success(res, `otp sent to ${body.email}`, {});
              })
              .catch((e) => {
                // logger.debug("error in %o ", e);
                // logger.error(e);
                console.log(e);
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
        donorInfoSchema.findOne({ email: req.body.email }).then((donorInfo) => {
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
const paymentSuccess = (req, res) => {
  console.log("hello redirection");
  // console.log(req.body);
  // console.log("req is given below");
  // console.log(req);
  res.send(req);
  return console.log(req.body);
  // donationSchema.findById(req.query.id).then((donationResponse) => {
  //   donationSchema
  //     .findOne({
  //       donorId: donationResponse.donorId,
  //       teacherId: donationResponse.teacherId,
  //       success: true,
  //     })
  //     .then((response) => {
  //       if (response) {
  //         console.log("if condition");
  //         donationSchema
  //           .findByIdAndUpdate(response._id, {
  //             donateAmount: (
  //               parseInt(response.donateAmount ?? "") +
  //               parseInt(donationResponse.donateAmount ?? "")
  //             ).toString(),
  //           })
  //           .then((response) => {
  //             donationSchema
  //               .findByIdAndDelete(donationResponse)
  //               .then((deleted) => {
  //                 (response.donateAmount = (
  //                   parseInt(response.donateAmount ?? "") +
  //                   parseInt(donationResponse.donateAmount ?? "")
  //                 ).toString()),
  //                   // response.success = true;
  //                   APIResponse.success(res, "success", response);
  //               })
  //               .catch((err) => {
  //                 APIResponse.badRequest(res, "Invalid data", {});
  //               });
  //           })
  //           .catch((e) => {
  //             APIResponse.badRequest(res, "Invalid data", {});
  //           });
  //       } else {
  //         console.log("else condition");
  //         donationSchema
  //           .findByIdAndUpdate(req.query.id, { success: true })
  //           .then((response) => {
  //             response.success = true;
  //             APIResponse.success(res, "success", response);
  //           })
  //           .catch((e) => {
  //             APIResponse.badRequest(res, "Invalid data", {});
  //           });
  //       }
  //     })
  //     .catch((e) => {
  //       APIResponse.badRequest(res, "Invalid data", {});
  //     });

  //   // res.status(200).redirect("http://localhost:3000/explore");
  // });
};

const donate = (req, res) => {
  console.log("req");
  // console.log(req.body);
  const apiEndpoint = "https://test.payu.in/_payment";

  const merchantKey = "Dku6RM";
  const merchantSalt = "zBdjwrjt7UY27WMdAfV2ZE3EFfoZI9UE";
  const productInfo = "Test Product";
  const amount = "100.00";
  const firstName = "John";
  const email = "john@example.com";
  const phone = "9999999999";
  const txnId = "TXN" + Date.now();
  const surl = "http://localhost:5000/donate/success";
  const furl = "http://localhost:5000/donate/failed";

  const params = {
    key: merchantKey,
    txnid: "txn123" || txnId,
    amount: amount,
    productinfo: productInfo,
    firstname: firstName,
    email: email,
    phone: phone,
    surl: surl,
    furl: furl,
    udf1: "",
    udf2: "",
    udf3: "",
    udf4: "",
    udf5: "",
    service_provider: "payu_paisa",
  };
  const hash = generatedHash(params, merchantSalt);
  params.hash = hash;
  console.log(hash);
  const payuForm = `
        <html>
        <body>
            <form id="payuForm" method="post" action="https://test.payu.in/_payment">
                <input type="hidden" name="key" value="${params.key}" />
                <input type="hidden" name="txnid" value="${params.txnid}" />
                <input type="hidden" name="amount" value="${params.amount}" />
                <input type="hidden" name="productinfo" value="${params.productinfo}" />
                <input type="hidden" name="firstname" value="${params.firstname}" />
                <input type="hidden" name="email" value="${params.email}" />
                <input type="hidden" name="phone" value="${params.phone}" />
                <input type="hidden" name="surl" value="${params.surl}" />
                <input type="hidden" name="furl" value="${params.furl}" />
                <input type="hidden" name="hash" value="${params.hash}" />
                <input type="hidden" name="service_provider" value="${params.service_provider}" />
            </form>
            <script type="text/javascript">
                document.getElementById('payuForm').submit();
            </script>
        </body>
        </html>
    `;

  res.send(payuForm);
  // return res.status(200).redirect(url);
  // teacherSchema
  //   .findById(req.body.teacherId)
  //   .then((teacherData) => {
  //     if (teacherData) {
  //       donationSchema
  //         .findOneAndDelete({ donorId: req.body.donorId, success: false })
  //         .then((response) => {
  //           donationSchema
  //             .create({
  //               donorId: req.body.donorId,
  //               donateAmount: req.body.donateAmount,
  //               teacherId: req.body.teacherId,
  //               school: teacherData.school,
  //             })
  //             .then((donationRes) => {
  //               res.status(200).redirect(url);
  //               // res
  //               //   .status(200)
  //               //   .redirect(
  //               //     `http://localhost:5000/donate/success?id=${donationRes._id}`
  //               //   );
  //             })
  //             .catch((e) => {
  //               console.log(e);
  //               APIResponse.badRequest(res, "Invalid data", {});
  //             });
  //         })
  //         .catch((e) => {
  //           APIResponse.internalServerError(res, "something went wrong", {});
  //         });
  //     } else {
  //       APIResponse.notFound(res, "teacher not found", {});
  //     }
  //   })
  //   .catch((e) => {
  //     console.log("e");
  //     console.log(e);
  //     APIResponse.badRequest(res, "Invalid data", {});
  //   });
};
const webhookSuccess = (req, res) => {
  try {
    sendMail("", req.body.toString(), "deepanshus094@gmail.com");
    APIResponse.success(res, "success", {});
  } catch (e) {
    APIResponse.success(res, "success", {});
  }
};

const donorHistory = (req, res) => {
  donationSchema
    .find({ donorId: req.query.id })
    .populate({ path: "teacherId", select: "-password" })
    .populate({ path: "school", select: "-password" })
    .then((historyData) => {
      APIResponse.success(res, "success", historyData);
    })
    .catch((Err) => {
      APIResponse.badRequest(res, "Invalid data", {});
    });
};
const donorNgos = (req, res) => {
  donationSchema
    .find({ donorId: req.query.id, success: true }, { school: 1 })
    .populate({ path: "school", select: "-password" })
    .then((data) => {
      const uniqueData = data.filter(
        (obj, index, self) =>
          index === self.findIndex((t) => t.school._id === obj.school._id)
      );
      APIResponse.success(res, "success", uniqueData);
    })
    .catch((Err) => {
      APIResponse.badRequest(res, "Invalid data", {});
    });
};

function generatedHash(params, salt) {
  let hashString = `${params.key}|${params.txnid}|${params.amount}|${params.productinfo}|${params.firstname}|${params.email}|${params.udf1}|${params.udf2}|${params.udf3}|${params.udf4}|${params.udf5}||||||${salt}`;

  console.log(hashString);
  return crypto.createHash("sha512").update(hashString).digest("hex");
}

module.exports = {
  donorRegister,
  donorUpdate,
  donorDelete,
  getDonorTeachers,
  generateOtp,
  verifyDonorOtp,
  getDonorInfo,
  getAllDonors,
  donate,
  donorHistory,
  paymentSuccess,
  donorNgos,
  getNgoTeachers,
  getNgoDetails,
  webhookSuccess,
};
