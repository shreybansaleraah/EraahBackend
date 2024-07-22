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
const axios = require("axios");
// const dotenv = require("dotenv");
// dotenv.config();
const donorRegister = (req, res) => {
  // console.log("Donor registeration start");
  donorInfoSchema
    .create(req.body)
    .then((value) => {
      APIResponse.success(res, "Successfully donor added", value);
    })
    .catch((err) => {
      console.log("err");
      console.log(err);
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
  donationSchema
    .findOne({
      name: req.body.firstname,
      email: req.body.email,
      phoneNumber: req.body.phone,
    })
    .then((donationResponse) => {
      Teacher.findOne(donationResponse.teacherId)
        .populate("school")
        .then((teacherResponse) => {
          console.log("teacherResponse");
          console.log(teacherResponse);
          let pgKey = teacherResponse.school.pgKey;
          let varParams = {
            type: "percentage",
            payuId: req.body.mihpayid,
            splitInfo: {
              [pgKey]: {
                aggregatorSubTxnId:
                  "txn" + new Date().getTime() + teacherResponse.school._id,
                aggregatorSubAmt: "90.00",
                aggregatorCharges: "10.00",
              },
            },
          };

          let generatedHashForSplit = generatedHashForSplit(varParams);

          let splitPayload = {
            key: process.env.merchantKeyTest,
            command: "payment_split",
            hash: generatedHashForSplit,
            var1: varParams,
          };

          axios.Axios.post(
            "https://test.payu.in/merchant/postservice.php?form=2",
            splitPayload,
            {
              Headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
            }
          )
            .then((splitResponse) => {
              console.log(splitResponse);
              APIResponse.success(res, "success", splitResponse);
            })
            .catch((splitErr) => {
              console.log(splitErr);
            });
        })
        .catch((teachErr) => {
          console.log(teachErr);
          APIResponse.badRequest(res, "Teacher not found", {});
        });
      donationSchema
        .findOne({
          donorId: donationResponse.donorId,
          teacherId: donationResponse.teacherId,
          success: true,
        })
        .then((response) => {
          if (response) {
            console.log("if condition");
            donationSchema
              .findByIdAndUpdate(response._id, {
                donateAmount: (
                  parseInt(response.donateAmount ?? "") +
                  parseInt(donationResponse.donateAmount ?? "")
                ).toString(),
              })
              .then((response) => {
                donationSchema
                  .findByIdAndDelete(donationResponse)
                  .then((deleted) => {
                    (response.donateAmount = (
                      parseInt(response.donateAmount ?? "") +
                      parseInt(donationResponse.donateAmount ?? "")
                    ).toString()),
                      // response.success = true;
                      APIResponse.success(res, "success", response);
                  })
                  .catch((err) => {
                    APIResponse.badRequest(res, "Invalid data", {});
                  });
              })
              .catch((e) => {
                APIResponse.badRequest(res, "Invalid data", {});
              });
          } else {
            console.log("else condition");
            donationSchema
              .findOneAndUpdate(
                { _id: donationResponse._id, txnId: req.body.txnid },
                { success: true }
              )
              .then((response) => {
                response.success = true;
                APIResponse.success(res, "success", response);
              })
              .catch((e) => {
                APIResponse.badRequest(res, "Invalid data", {});
              });
          }
        })
        .catch((e) => {
          APIResponse.badRequest(res, "Invalid data", {});
        });

      res.status(200).redirect("http://localhost:3000/explore");
    });
};

const donate = (req, res) => {
  console.log("req");
  // console.log(req.body);
  const apiEndpoint = "https://test.payu.in/_payment";

  // const hash = crypto.createHash("sha512").update(hashString).digest("hex");
  // console.log(hashString);

  const bankAccount1 = {
    beneficiaryAccount: "78790100020247",
    ifscCode: "BARB0VJMBAL",
    beneficiaryName: "Deepanshu",
  };
  const bankAccount2 = {
    beneficiaryAccount: "78790100020247",
    ifscCode: "BARB0VJMBAL",
    beneficiaryName: "Deepanshu",
  };

  // account2: {
  //   amount: "20.00",
  //   ...bankAccount2,
  // },

  // <input type="hidden" name="service_provider" value="${payuParams.service_provider}" />

  // res.send(payuForm);
  // return res.status(200).redirect(url);
  donorInfoSchema
    .findById(req.body.donorId)
    .then((donorData) => {
      const amount = req.body.donateAmount;
      const productinfo = "Live Product";
      const firstname = donorData.name;
      const email = donorData.email;
      const phone = donorData.phoneNumber;
      const surl = "http://localhost:5000/donate/success";
      const furl = "http://localhost:5000/donate/failed";
      const udf1 = "";
      const udf2 = "";
      const udf3 = "";
      const udf4 = "";
      const udf5 = "";

      teacherSchema
        .findById(req.body.teacherId)
        .then((teacherData) => {
          if (teacherData) {
            donationSchema
              .findOneAndDelete({ donorId: req.body.donorId, success: false })
              .then((response) => {
                const txnid = "txn" + new Date().getTime() + req.body.donorId;
                // const txnid = "txn" + "123";
                const hashString = `${process.env.merchantKeyTest}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${process.env.merchantSaltTest}`;
                const hash = crypto
                  .createHash("sha512")
                  .update(hashString, "utf8")
                  .digest("hex");

                donationSchema
                  .create({
                    donorId: req.body.donorId,
                    donateAmount: req.body.donateAmount,
                    txnId: txnid,
                    teacherId: req.body.teacherId,
                    school: teacherData.school,
                  })
                  .then((donationRes) => {
                    const payuParams = {
                      key: process.env.merchantKeyTest,
                      txnid: txnid,
                      amount: amount,
                      productinfo: productinfo,
                      firstname: firstname,
                      email: email,
                      phone: phone,
                      surl: surl,
                      furl: furl,
                      hash: hash,
                      // hash: "616826e3d8b6d1bafc6f2108c8c110c29c3246f4abfc408e72e378e9bd4ef661ebad8cd72c1aa38d1435f41d0565813f02b8cb60ad9b5d294a8390bb5673cb21",
                      service_provider: "payu_paisa",
                    };

                    const payuForm = `
        <html>
        <body>
            <form id="payuForm" method="POST" action=${
              apiEndpoint || "https://secure.payu.in/_payment"
            }>
                <input type="hidden" name="key" value="${payuParams.key}" />
                <input type="hidden" name="txnid" value="${payuParams.txnid}" />
                <input type="hidden" name="amount" value="${
                  payuParams.amount
                }" />
                <input type="hidden" name="productinfo" value="${
                  payuParams.productinfo
                }" />
                <input type="hidden" name="firstname" value="${
                  payuParams.firstname
                }" />
                <input type="hidden" name="email" value="${payuParams.email}" />
                <input type="hidden" name="phone" value="${payuParams.phone}" />
                <input type="hidden" name="surl" value="${payuParams.surl}" />
                <input type="hidden" name="furl" value="${payuParams.furl}" />
                <input type="hidden" name="hash" value="${payuParams.hash}" />
                 <input type="hidden" name="type" value="${payuParams.type}" />
      
                </form>
                <script type="text/javascript">
                document.getElementById('payuForm').submit();
                </script>
                </body>
                </html>
                `;

                    // res.status(200).redirect(url);
                    res.send(payuForm);
                    // res
                    //   .status(200)
                    //   .redirect(
                    //     `http://localhost:5000/donate/success?id=${donationRes._id}`
                    //   );
                  })
                  .catch((e) => {
                    console.log(e);
                    APIResponse.badRequest(res, "Invalid data", {});
                  });
              })
              .catch((e) => {
                APIResponse.internalServerError(
                  res,
                  "something went wrong",
                  {}
                );
              });
          } else {
            APIResponse.notFound(res, "teacher not found", {});
          }
        })
        .catch((e) => {
          console.log("e");
          console.log(e);
          APIResponse.badRequest(res, "Invalid data", {});
        });
    })
    .catch((e) => {
      APIResponse.badRequest(res, "Invalid donor", {});
    });
};
const webhookSuccess = (req, res) => {
  try {
    // sendMail("", req.body.toString(), "deepanshus094@gmail.com");
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

function generatedHashForSplit(varParam) {
  let hashString = `${
    process.env.merchantKeyTest
  }|payment_split|${JSON.stringify(varParam)}|${process.env.merchantSaltTest}`;

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
