import bcrypt from "bcryptjs";
import AppError from "@src/utils/appError";
import { userModel } from "@src/models/userModel";
import { userType } from "@src/models/userModel";
import {
  OtpBody,
  LoginType,
  ForgotPasswordType,
  resetPassword,
  forgotPasswordOtpType,
} from "@src/types/authTypes";
import {
  loginRefreshToken,
  loginAccessToken,
  resetPasswordToken,
  verifyResetPasswordToken,
} from "@src/utils/jwt";

// Signup Service
export const signUpService = async (body: userType) => {
  // Check if user already exist
  const existingUser = await userModel.findOne({ email: body.email });
  if (existingUser) {
    throw new AppError(400, "User already exist with this email");
  }

  // Hash the password
  const hash = await bcrypt.hash(body.password, 12);

  // Create an OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Create an OTP Expiry
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  // Create New User
  const createUser = await userModel.create({
    ...body,
    otp,
    otpExpiry,
    password: hash,
  });

  // Remove password and otp from response
  const safeUser = createUser.toObject();
  delete safeUser.password;
  delete safeUser.otp;
  return safeUser;
};

// Verify OTP Service
export const otpVerifyService = async (body: OtpBody) => {
  // Check if email and otp is provided
  if (!body.email || !body.otp) {
    throw new AppError(400, "Email and OTP is required");
  }

  // Check if user exists and OTP is valid
  const user = await userModel.findOne({ email: body.email });
  if (user.isVerified === true) {
    throw new AppError(400, "User already Verified");
  }

  // Check if user exists and OTP is valid
  if (!user || user.otp !== body.otp) {
    throw new AppError(400, "Invalid OTP");
  }

  // Check if OTP is expired
  if (!user.otpExpiry || user.otpExpiry.getTime() < Date.now()) {
    throw new AppError(400, "OTP has expired");
  }

  // Update user to verified
  const updateUser = await userModel.findOneAndUpdate(
    { email: body.email },
    {
      isVerified: true,
      otp: null,
      otpExpiry: null,
    },
  );
  return updateUser;
};

// Login Service
export const loginService = async (body: LoginType) => {
  // Check if user exists
  const user = await userModel
    .findOne({ email: body.email })
    .select("+password");
  if (user?.isVerified === false) {
    throw new AppError(400, "Please verify your account first");
  }

  const checkPassword = await bcrypt.compare(body.password, user.password);
  if (!checkPassword) {
    throw new AppError(400, "Incorrect Password");
  }

  // Check if password is correct
  const payload = {
    id: user._id,
    role: user.role,
  };
  const refreshToken = loginRefreshToken(payload);
  const accessToken = loginAccessToken(payload);

  // Set cookie with refresh token
  return {
    user,
    refreshToken,
    accessToken,
  };
};

// Forgot Password
export const forgotPasswordService = async (body: ForgotPasswordType) => {
  if (!body.email) {
    throw new AppError(400, "Email is required");
  }

  // Check if user exists
  const user = await userModel.findOne({
    email: body.email,
  });

  if (!user) {
    throw new AppError(404, "User not found with this email");
  }

  // Create OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log("otp is".bgBrightBlue, otp);

  // Save OTP
  await userModel.findOneAndUpdate({ email: body.email }, { otp });

  return null;
};

// Verify Forgot Password OTP
export const verifyForgotPasswordOtpService = async (
  body: forgotPasswordOtpType,
) => {
  if (!body.otp) {
    throw new AppError(400, "OTP is required");
  }

  // Check if user exists
  const user = await userModel.findOne({
    email: body.email,
  });

  if (!user) {
    throw new AppError(400, "User not found");
  }

  // Check OTP
  if (user.otp !== body.otp) {
    throw new AppError(400, "Invalid OTP");
  }

  // OTP is valid — clear it so the same OTP cannot be used twice
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  // Give a short-lived ticket that proves this OTP check passed
  const resetToken = resetPasswordToken({ email: user.email });

  return { resetToken };
};

// Reset Password
export const resetPasswordService = async (body: resetPassword) => {
  if (!body.resetToken || !body.newPassword) {
    throw new AppError(400, "Reset token and New Password fields are required");
  }

  // Read the email from inside the token, never from the body
  let payload: { email?: string };
  try {
    payload = verifyResetPasswordToken(body.resetToken) as { email?: string };
  } catch {
    throw new AppError(400, "Reset link is invalid or expired");
  }

  if (!payload.email) {
    throw new AppError(400, "Reset link is invalid");
  }

  // Check if user exists
  const user = await userModel.findOne({
    email: payload.email,
  });

  if (!user) {
    throw new AppError(400, "User not found");
  }

  // Hash the new password before saving it
  const hash = await bcrypt.hash(body.newPassword, 12);

  // Update password
  await userModel.findOneAndUpdate(
    { email: payload.email },
    { password: hash },
  );

  return null;
};


// Token Rotation

