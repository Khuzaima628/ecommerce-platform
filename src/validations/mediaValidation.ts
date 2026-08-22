import joi from "joi";

// Only these image types are allowed
const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

export const presignedUrlValidation = joi.object({
  fileName: joi.string().required().messages({
    "string.empty": "fileName cannot be empty",
    "any.required": "fileName is required",
  }),

  fileType: joi
    .string()
    .valid(...allowedTypes)
    .required()
    .messages({
      "any.only": `fileType must be one of [${allowedTypes}]`,
      "any.required": "fileType is required",
    }),
});
