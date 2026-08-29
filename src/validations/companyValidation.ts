import joi from "joi";

export const companyValidation = joi.object({
  companyName: joi.string().required().messages({
    "string.empty": "Company name is required",
    "string.base": "Company name is required",
  }),
  bio: joi.string().max(5000).required().messages({
    "string.empty": "Company name is required",
    "string.base": "Company name is required",
    "string.max": "Company name is required",
  }),
  logo: joi.string().required().messages({
    "string.empty": "Company name is required",
    "string.base": "Company name is required",
  }),
  address: joi.object({
    street: joi.string().required(),
    city: joi.string().required(),
    state: joi.string().required(),
    country: joi.string().required(),
    zip: joi.string().required(),
  }),
  taxId: joi.string().required().messages({
    "string.empty": "taxId name is required",
    "string.base": "taxId name is required",
    "any.required": "taxId name is required",
  }),
});
