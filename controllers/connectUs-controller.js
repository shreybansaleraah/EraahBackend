const contactUsSchema = require("../models/contactUsSchema");
const { APIResponse } = require("../utility");

const contactUs = (req, res) => {
  contactUsSchema
    .create(req.body)
    .then((value) => {
      APIResponse.success(res, "successfully added", {});
    })
    .catch((e) => {
      APIResponse.badRequest(res, "Invalid data", {});
    });
};

module.exports = {
  contactUs,
};
