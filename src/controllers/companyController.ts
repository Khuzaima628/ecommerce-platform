import catchAsync from "@src/utils/catchAsync";
import {
  createCompanyService,
  getCompanyService,
} from "@src/services/companyService";
import apiResponse from "@src/utils/apiResponse";
import { Request, Response } from "express";

// Get company controller
export const getCompanyController = catchAsync(
  async (req: Request, res: Response) => {
    const company = await getCompanyService(req.user._id);
    const message = "Get Company Successfully";
    apiResponse.success(res, company, message, 200);
  },
);

// create company controller
export const createCompanyController = catchAsync(
  async (req: Request, res: Response) => {
    const body = req.body;
    const id = req.user._id;
    const company = await createCompanyService(id, body);
    const message = "Company Created Successfully";
    apiResponse.success(res, company, message, 201);
  },
);
