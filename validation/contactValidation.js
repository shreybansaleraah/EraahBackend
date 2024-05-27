const { Joi } = require("celebrate");

module.exports = {
  contactFields: Joi.object({
    firstName: Joi.string().required().messages({
      "string.base": "firstName should be a string",
      "any.required": "firstName is required",
    }),
    lastName: Joi.string().required().messages({
      "string.base": "lastName should be a string",
      "any.required": "lastName is required",
    }),
    ngoName: Joi.string().required().messages({
      "string.base": "NGO name should be a string",
      "any.required": "NGO name is required",
    }),
    ngoAim: Joi.string().required().messages({
      "string.base": "NGO aim should be a string",
      "any.required": "NGO aim is required",
    }),
    sections: Joi.string().required().messages({
      "string.base": "sections aim should be a string",
      "any.required": "sections aim is required",
    }),
    description: Joi.string().required().messages({
      "string.base": "Description should be a string",
      "any.required": "Description is required",
    }),
    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .messages({
        "string.email": "Invalid email",
      })
      .required(),
    phone: Joi.string().min(10).max(10).required().messages({
      "string.base": "phone should be a string",
      "any.required": "phone is required",
      "string.phone": "Invalid phone",
    }),
  }),
};
