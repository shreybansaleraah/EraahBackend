const { Joi } = require("celebrate");

module.exports = {
  donorFields: Joi.object({
    name: Joi.string().required().messages({
      "string.base": "name should be a string",
      "any.required": "name is required",
    }),
    phoneNumber: Joi.string().required().messages({
      "string.base": "phoneNumber should be a string",
      "any.required": "phoneNumber is required",
    }),

    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .messages({
        "string.email": "Invalid email",
      })
      .required(),
    pan: Joi.string()
      .required()
      .pattern(/^([A-Z]){5}([0-9]){4}([A-Z]){1}$/)
      .messages({
        "string.base": "pan should be a string",
        "any.required": "pan is required",
      }),
    aadhar: Joi.string()
      .required()
      .pattern(/^\d{12}$/)
      .messages({
        "string.base": "aadhar should be a string",
        "any.required": "aadhar is required",
      }),

    gender: Joi.string().optional().allow(""),
    age: Joi.string().optional().allow(""),
    bankDetails: Joi.object()
      .keys({
        name: Joi.string().required().messages({
          "string.base": "name should be a string",
          "any.required": "name is required",
        }),
        accountNumber: Joi.string()
          .alphanum()
          .min(6)
          .max(20)
          .required()
          .messages({
            "string.base": "accountNumber should be a string",
            "any.required": "accountNumber is required",
          }),
        ifsc: Joi.string().required().messages({
          "string.base": "ifsc should be a string",
          "any.required": "ifsc is required",
        }),
        bankName: Joi.string().required().messages({
          "string.base": "bankName should be a string",
          "any.required": "bankName is required",
        }),
        branchName: Joi.any().messages({
          "string.base": "branchName should be a image",
          "any.required": "branchName is required",
        }),
      })
      .required(),
    address: Joi.object().keys({
      place: Joi.string().optional().allow("").messages({
        "string.base": "place should be a string",
      }),
      city: Joi.string().optional().allow("").messages({
        "string.base": "city should be a string",
      }),
      state: Joi.string().optional().allow("").messages({
        "string.base": "state should be a string",
      }),
    }),
  }),

  donorAuthLogin: Joi.object({
    // phone: Joi.string().required().min(10).max(10).messages({
    //   "string.base": "phone should be a string",
    //   "any.required": "phone is required",
    //   "string.pattern.base": "Invalid phone number",
    // }),

    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .messages({
        "string.email": "Invalid email",
        "any.required": "email is required",
      })
      .required(),
  }),
  donorAuthVerify: Joi.object({
    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .messages({
        "string.email": "Invalid email",
        "any.required": "email is required",
      })
      .required(),
    otp: Joi.string()
      .min(4)
      .max(4)
      .messages({
        "string.pattern.base": "Invalid otp",
      })
      .optional()
      .allow(""),
  }),

  donorId: Joi.object({
    id: Joi.string().required().messages({
      "string.base": "id should be a string",
      "any.required": "id is required",
    }),
  }),
  idRequire: Joi.object({
    id: Joi.string().required().messages({
      "string.base": "id should be a string",
      "any.required": "id is required",
    }),
  }),
  donorGetTeachers: Joi.object({
    id: Joi.string().required().messages({
      "string.base": "id should be a string",
      "any.required": "id is required",
    }),
    ngoId: Joi.string().required().messages({
      "string.base": "NGO id should be a string",
      "any.required": "NGO id is required",
    }),
  }),
  donate: Joi.object({
    donorId: Joi.string().required().messages({
      "string.base": "id should be a string",
      "any.required": "id is required",
    }),
    donateAmount: Joi.string().required().messages({
      "string.base": "amount should be a string",
      "any.required": "amount is required",
    }),
    teacherId: Joi.string().required().messages({
      "string.base": "teacherId should be a string",
      "any.required": "teacherId is required",
    }),
  }),
};
