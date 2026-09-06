import joi from "joi";

export const cartProductValidation = joi.object({
  quantity: joi.number().min(1).max(99).required().messages({
    "number.min": "Quantity must be greater than 0",
    "number.max": "Quantity must be less than 100",
    "any.required": "Quantity is required",
  }),
});
