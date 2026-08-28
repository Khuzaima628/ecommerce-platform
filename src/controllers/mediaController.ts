import type { Request, Response } from "express";
import { presignedUrlService } from "@src/services/mediaService";
import catchAsync from "@src/utils/catchAsync";
import apiResponse from "@src/utils/apiResponse";

// Gives the frontend a link to upload one image.
export const presignedUrlController = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const data = await presignedUrlService(req.body);
    const message = "Upload URL created successfully";
    apiResponse.success(res, data, message, 200);
  },
);
