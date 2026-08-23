import catchAsync from "@src/utils/catchAsync";
import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "@src/utils/jwt";
import AppError from "@src/utils/appError";
import { userModel } from "@src/models/userModel";

export const protectMiddleware = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new AppError(
        401,
        "You are not logged in! Please log in to get access.",
      );
    }

    let decoded: any;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      throw new AppError(401, "Invalid token. Please log in again.");
    }

    const user = await userModel.findById(decoded.id);
    if (!user) {
      throw new AppError(
        401,
        "The user belonging to this token does no longer exist.",
      );
    }
    req.user = user;
    next();
  },
);
