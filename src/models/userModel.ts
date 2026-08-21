import { model, models, Schema, type InferSchemaType } from "mongoose";

enum roles {
  Admin = "admin",
  Seller = "seller",
  Customer = "customer",
}

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is Required"],
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Email is Required"],
      validate: {
        validator: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: "Please provide a valid email address",
      },
    },
    password: {
      type: String,
      required: [true, "Password is Required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    profilePicture: {
      type: String,
      default:
        "https://res.cloudinary.com/dk4l1jz0g/image/upload/v1682171506/avatar_default_gm2f1p.png",
    },
    role: {
      type: String,
      enum: roles,
      lowercase: true,
      default: roles.Customer,
      trim: true,
      required: [true, "Role is Required"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: Number,
      required: [true, "OTP is Required"],
      max: [999999, "OTP must be 6 digits only"],
      validate: {
        validator: (value: string | null) =>
          value === null || /^\d{6}$/.test(value),
        message: "OTP must be exactly 6 digits",
      },
    },
    otpExpiry: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

type userType = InferSchemaType<typeof userSchema>
const userModel = models.User || model("User", userSchema);
export { userModel, type userType, roles };
