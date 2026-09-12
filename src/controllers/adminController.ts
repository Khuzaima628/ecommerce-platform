import catchAsync from "@src/utils/catchAsync";
import apiResponse from "@src/utils/apiResponse";
import { Request, Response } from "express";
import { getAllOrdersService, getAllUsersService, getAllProductsAdminService } from "@src/services/adminService";


// Get All Oders
export const getAllOrdersController = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.user._id;
    const { status } = req.query as { status: string };
    const orders = await getAllOrdersService(id, status);
    const message = "All Orders Fetch Successfully";
    apiResponse.success(res, orders, message, 200);
  },
);

// Get all Users
export const getAllUsersController = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.user._id;
    const { role } = req.query as { role: string };
    const users = await getAllUsersService(id, role);
    const message = "All Users Fetch Successfully";
    apiResponse.success(res, users, message, 200);
  },
);

// Get All Products
export const getAllProductsAdminController = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.user._id;
    const products = await getAllProductsAdminService(id, req.query);
    const message = "All Products Fetch Successfully";
    apiResponse.success(res, products, message, 200);
  },
);
