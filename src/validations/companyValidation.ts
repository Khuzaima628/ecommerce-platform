import joi from "joi";

export const companyValidation = joi.object({
  companyName: joi.string().required().messages({
    "string.empty": "Company name is required",
    "string.base": "Company name must be text",
    "any.required": "Company name is required",
  }),
  bio: joi.string().max(5000).required().messages({
    "string.empty": "Bio is required",
    "string.base": "Bio must be text",
    "string.max": "Bio cannot be longer than 5000 characters",
    "any.required": "Bio is required",
  }),
  // The logo is a URL string (from the media upload flow), not the upload
  // object/file itself — the frontend must send the uploaded file's URL
  // here, after the upload step has already completed.
  logo: joi.string().required().messages({
    "string.empty": "Logo is required",
    "string.base": "Logo must be a URL string, not a file or object",
    "any.required": "Logo is required",
  }),
  address: joi.object({
    street: joi.string().required(),
    city: joi.string().required(),
    state: joi.string().required(),
    country: joi.string().required(),
    zip: joi.string().required(),
  }),
  taxId: joi.string().required().messages({
    "string.empty": "Tax ID is required",
    "string.base": "Tax ID must be text",
    "any.required": "Tax ID is required",
  }),
});
