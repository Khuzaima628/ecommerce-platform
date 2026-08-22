import {
  signUpService,
  otpVerifyService,
  loginService,
  forgotPasswordService,
  verifyForgotPasswordOtpService,
  resetPasswordService,
} from "@src/services/authService";
import catchAsync from "@src/utils/catchAsync";
import apiResponse from "@src/utils/apiResponse";
import { Request, Response } from "express";

// Signup Controller
export const signUpController = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const user = await signUpService(req.body);
    const message = "User created successfully";
    apiResponse.success(res, user, message, 201);
  },
);

// Verify OTP Controller
export const optVerifyController = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const user = await otpVerifyService(req.body);
    const message = "User verified successfully";
    apiResponse.success(res, user, message, 200);
  },
);

// Login Contoller
export const loginController = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const user = await loginService(req.body);
    const message = "User logged in successfully";
    apiResponse.success(res, user, message, 200);
  },
);

// Forgot Password Controller
export const forgotPasswordController = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const user = await forgotPasswordService(req.body);
    const message = "OTP sent to your email";
    apiResponse.success(res, user, message, 200);
  },
);

// Verify Forgot Password OTP Controller
export const verifyForgotPasswordOtpController = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const user = await verifyForgotPasswordOtpService(req.body);
    const message = "OTP verified successfully";
    apiResponse.success(res, user, message, 200);
  },
);

// Reset Password Controller
export const resetPasswordController = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const user = await resetPasswordService(req.body);
    const message = "Password reset successfully";
    apiResponse.success(res, user, message, 200);
  },
);
