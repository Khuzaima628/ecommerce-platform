import catchAsync from "@src/utils/catchAsync";
import apiResponse from "@src/utils/apiResponse";
import { Response, Request } from "express";
import {
  hideProductService,
  increseStockService,
  deleteProductService,
  updateProductService,
  createProductService,
  getAllProductsService,
  getProductByIdService,
  getSellerProductsService
} from "@src/services/productService";

// Create Product Controller
export const createProductConstroller = catchAsync(
  async (req: Request, res: Response) => {
    const body = req.body;
    const id = req.user._id;
    const product = await createProductService(body, id);
    const message = "Product Created Successfully";
    apiResponse.success(res, product, message, 201);
  },
);

// Get all Seller Products
export const getProductsController = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.user._id;
    const products = await getSellerProductsService(id);
    const message = "Products Fetched Successfully";
    apiResponse.success(res, products, message, 200);
  },
);

// Get Product by Id
export const getProductByIdController = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.user._id;
    const { pid } = req.params;
    const products = await getProductByIdService(id, pid);
    const message = "Products Fetched Successfully";
    apiResponse.success(res, products, message, 200);
  },
);

// Update Product Controller
export const updateProductController = catchAsync(
  async (req: Request, res: Response) => {
    const body = req.body;
    const id = req.user._id;
    const { pid } = req.params;
    const product = await updateProductService(body, pid, id);
    const message = "Product Updated Successfully";
    apiResponse.success(res, product, message, 200);
  },
);

// Delete Product Controller
export const deleteProductController = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.user._id;
    const { pid } = req.params;
    const product = await deleteProductService(id, pid);
    const message = "Product Deleted Successfully";
    apiResponse.success(res, product, message, 200);
  },
);

// Hide Product Controller
export const hideProductController = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.user._id;
    const { pid } = req.params;
    await hideProductService(id, pid);
    apiResponse.success(res, null, "Product updated successfully", 200);
  },
);

// Update Stock Controller
export const increseStockController = catchAsync(
  async (req: Request, res: Response) => {
    const body = req.body;
    const id = req.user._id;
    const { pid } = req.params;
    const product = await increseStockService(id, pid, body);
    const message = "Stock Updated Successfully";
    apiResponse.success(res, product, message, 200);
  },
);

// =========================  CUSTOMER CONTROLLER   =========================

export const getAllProductsController = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.user._id;
    const products = await getAllProductsService(id, req.query);
    const message = "Products Fetched Successfully";
    apiResponse.success(res, products, message, 200);
  },
);
