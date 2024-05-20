const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");
// const { mongoose } = require("mongoose");
// import process.env from "./process.env.js";

const sendMail = async (subject, message, targetEmail) => {
  console.log("token generating");
  const oauth2Client = new OAuth2Client(
    process.env.clientId,
    process.env.clientSecret,
    process.env.redirectUri
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.refreshToken,
  });
  const accessToken = await oauth2Client.getAccessToken();
  console.log("token generated");
  var transporter = nodemailer.createTransport({
    // service: "gmail",
    // host: "smtp.gmail.com",
    // port: 465,
    // secure: true,
    // auth: {
    //   user: "bhavusha590@gmail.com",
    //   pass: "qesmjqvbryyvvztp",
    // },
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: "shrey.bansal@eraah.org",
      clientId: process.env.clientId,
      clientSecret: process.env.clientSecret,
      refreshToken: process.env.refreshToken,
      accessToken,
    },
  });

  var mailOptions = {
    from: "shrey.bansal@eraah.org",
    to: targetEmail,
    subject: subject,

    html:
      "<p>Your Eraah <b>verify OTP</b> is : </p>" + "<b>" + message + "</b>",
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = { sendMail };
