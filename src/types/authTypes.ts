// OtpBody
export interface OtpBody {
  email: string;
  otp: string;
}

// LoginType
export interface LoginType {
  email: string;
  password: string;
}

// ForgotPasswordType
export interface ForgotPasswordType {
  email: string;
}

// forgotPasswordOtpType
export interface forgotPasswordOtpType {
  email: string;
  otp: number;
}

// ResetPasswordType
export interface resetPassword {
  resetToken: string;
  newPassword: string;
}

// tokenRotationType
export interface tokenRotationType {
  refreshToken: string;
}

// UpdateProfileInput
export interface UpdateProfileInput {
  name?: string;
  email?: string;
  profilePicture?: string;
}
