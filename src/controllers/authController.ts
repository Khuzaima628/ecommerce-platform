import {
  signUpService,
  otpVerifyService,
  loginService,
  forgotPasswordService,
  verifyForgotPasswordOtpService,
  resetPasswordService,
  getMeService,
  updateProfileService,
  tokenRotationService,
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

//Token Rotation Controller
export const tokenRotationController = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const body = req.body;
    const newToken = await tokenRotationService(body);
    const message = "New Refresh Token Generated Sucessfully";
    apiResponse.success(res, newToken, message, 200);
  },
);

// Get Me
export const getMeController = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.user._id;
    const currentUser = await getMeService(id);
    const message = "User Data Fetcehed Sucessfully";
    apiResponse.success(res, currentUser, message, 200);
  },
);

// Update Profile Controller
export const updateProfileController = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.user._id;
    const updateUser = await updateProfileService(id, req.body);
    const message = "user update sucessfully";
    apiResponse.success(res, updateUser, message, 200);
  },
);

//
