import type { Request, Response } from "express";
import { uploadFileService } from "@src/services/mediaService";
import catchAsync from "@src/utils/catchAsync";
import apiResponse from "@src/utils/apiResponse";

// One endpoint for every upload in the app: profile, product, banner.
export const uploadController = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    // multer puts the files in req.files, and text fields in req.body
    const files = req.files as Express.Multer.File[] | undefined;

    const data = await uploadFileService(files, req.body.folder);
    const message = "File uploaded successfully";
    apiResponse.success(res, data, message, 201);
  },
);
