import joi from "joi";
import { roles } from "@src/models/userModel";

// Auth Validation
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
  profilePicture: joi.string().max(1).messages({
    "string.min": "only 1 image is required",
    "string.empty": "only 1 image is required",
    "any.required": "only 1 image is required",
  }),
  role: joi
    .string()
    .valid(...Object.values(roles))
    .messages({
      "any.only": `role must be one of [${Object.values(roles)}]`,
    }),
});

// Login Validation
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

// OTP Validation
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

// Forgot Password Validation
export const forgotPasswordValidation = joi.object({
  email: joi.string().email().required().messages({
    "string.email": "please enter valid email",
    "string.empty": "email cannot be empty",
    "any.required": "email is required",
  }),
});

// Reset Password Validation
export const resetPasswordValidation = joi.object({
  resetToken: joi.string().required().messages({
    "string.empty": "reset token cannot be empty",
    "any.required": "reset token is required",
  }),

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

// Token Rotation Validation
export const tokenRotationValidation = joi.object({
  refreshToken: joi.string().required().messages({
    "string.empty": "refresh token cannot be empty",
    "any.required": "refresh token is required",
  }),
});

export const updateProfileValidation = joi
  .object({
    name: joi.string().min(3).messages({
      "string.base": "Name must be a string",
      "string.min": "Name must be at least 3 characters long",
    }),

    profilePicture: joi.string().uri().messages({
      "string.base": "Profile picture must be a string",
      "string.uri": "Profile picture must be a valid URL",
    }),
  })
  .min(1)
  .messages({
    "object.min": "At least one field is required to update your profile",
  });
