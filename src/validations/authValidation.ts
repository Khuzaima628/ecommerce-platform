import joi from "joi";
import { roles } from "@src/models/userModel";

export const authValidation = joi.object({
  name: joi.string().min(3).required().messages({
    "string.base": "name should be a type of text",
    "string.empty": "name cannot be empty",
    "string.min": "name should have minimum 3 characters",
    "any.required": "name is required",
  }),
  email: joi.string().email().required().messages({
    "string.email": "please enter valid email",
    "string.empty": "email cannot be empty",
    "any.required": "email is required",
  }),
  password: joi.string().min(6).required().messages({
    "string.min": "password should have minimum 6 characters",
    "string.empty": "password cannot be empty",
    "any.required": "password is required",
  }),
  role: joi
    .string()
    .valid(...Object.values(roles))
    .messages({
      "any.only": `role must be one of [${roles}]`,
    }),
});

export const loginValidation = joi.object({
  email: joi.string().email().required().messages({
    "string.email": "please enter valid email",
    "string.empty": "email cannot be empty",
    "any.required": "email is required",
  }),
  password: joi.string().min(6).required().messages({
    "string.min": "password should have minimum 6 characters",
    "string.empty": "password cannot be empty",
    "any.required": "password is required",
  }),
});

export const otpValidation = joi.object({
  email: joi.string().email().required().messages({
    "string.email": "please enter valid email",
    "string.empty": "email cannot be empty",
    "any.required": "email is required",
  }),
  otp: joi.number().required().messages({
    "number.base": "otp should be a type of number",
    "number.empty": "otp cannot be empty",
    "any.required": "otp is required",
  }),
});

export const forgotPasswordValidation = joi.object({
  email: joi.string().email().required().messages({
    "string.email": "please enter valid email",
    "string.empty": "email cannot be empty",
    "any.required": "email is required",
  }),
});

export const resetPasswordValidation = joi.object({
  newPassword: joi.string().min(6).required().messages({
    "string.min": "password should have minimum 6 characters",
    "string.empty": "password cannot be empty",
    "any.required": "password is required",
  }),

  confirmPassword: joi
    .string()
    .valid(joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "confirm password must match new password",
      "string.empty": "confirm password cannot be empty",
      "any.required": "confirm password is required",
    }),
});
