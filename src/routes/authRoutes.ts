import route from "express";
import validateSchemaPayload from "@src/utils/validateSchemaPayload";
import {
  otpValidation,
  authValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from "@src/validations/authValidation";
import {
  getMeController,
  loginController,
  signUpController,
  optVerifyController,
  updateProfileController,
  resetPasswordController,
  forgotPasswordController,
  verifyForgotPasswordOtpController,
} from "@src/controllers/authController";
import { protectMiddleware } from "@src/middlewares/protectMiddleware";
// Router instance for auth
const authRoute = route.Router();

// POST /api/v1/auth/signup
authRoute.post(
  "/signup",
  validateSchemaPayload(authValidation),
  signUpController,
);

// POST /api/v1/auth/otp-verify
authRoute.post(
  "/otp-verify",
  validateSchemaPayload(otpValidation),
  optVerifyController,
);

// POST /api/v1/auth/login
authRoute.post(
  "/login",
  validateSchemaPayload(loginValidation),
  loginController,
);

// POST /api/v1/auth/forgot-password
authRoute.post(
  "/forgot-password",
  validateSchemaPayload(forgotPasswordValidation),
  forgotPasswordController,
);

// POST /api/v1/auth/verify-forgot-password-otp
authRoute.post(
  "/verify-forgot-password-otp",
  validateSchemaPayload(otpValidation),
  verifyForgotPasswordOtpController,
);

// POST /api/v1/auth/reset-password
authRoute.post(
  "/reset-password",
  validateSchemaPayload(resetPasswordValidation),
  resetPasswordController,
);

// Get /api/v1/auth/get-me
authRoute.get("/get-me", protectMiddleware, getMeController);

//PATCG /api/v1/auth/update-profile
authRoute.patch("/get-me",protectMiddleware, updateProfileController)

export default authRoute;
