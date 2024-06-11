const { Joi } = require("celebrate");
const { idRequire } = require("./donorValidation");

module.exports = {
  addBlog: Joi.object({
    title: Joi.string().required().messages({
      "string.base": "title should be a string",
      "any.required": "title is required",
    }),
    content: Joi.string().required().messages({
      "string.base": "content should be a string",
      "any.required": "content is required",
    }),
  }),
  reqId: Joi.object({
    id: Joi.string().required().messages({
      "string.base": "id should be a string",
      "any.required": "id is required",
    }),
  }),
};
