const { Joi } = require("celebrate");

module.exports = {
  getGalleryFields: Joi.object({
    ngoId: Joi.string().required().messages({
      "string.base": "NGO id should be a string",
      "any.required": "NGO id is required",
    }),
    teacherId: Joi.string().optional().messages({
      "string.base": "Teacher id should be a string",
      "any.required": "Teacher id is required",
    }),
    studentId: Joi.string().optional().messages({
      "string.base": "Student id name should be a string",
      "any.required": "Student id name is required",
    }),
  }),
};
