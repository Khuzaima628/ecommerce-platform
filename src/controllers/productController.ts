import catchAsync from "@src/utils/catchAsync";
import apiResponse from "@src/utils/apiResponse";
import { Response, Request } from "express";
import {createProductService,getProductsService} from "@src/services/productService"

// Create Product Controller
export const createProductConstroller = catchAsync(
  async (req: Request, res: Response) => {
    const body = req.body;
    const id = req.user._id;
    const product = await createProductService(body,id);
    const message = "Product Created Successfully";
    apiResponse.success(res, product, message, 201);
  },
);

// Get all Seller Products
export const getProductsController = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.user._id;
    const products = await getProductsService(id)
    const message = "Products Fetched Successfully";
    apiResponse.success(res, products, message, 200);
  },
);
