import catchAsync from "@src/utils/catchAsync";
import apiResponse from "@src/utils/apiResponse";
import { Response, Request } from "express";
import {
  createOrderService,
  getMyOrdersService,
  getOrderByIdService,
  cancelOrderService,
  createCheckoutSessionService,
} from "@src/services/orderService";

// Create Order Controller — turns the current cart into an order
export const createOrderController = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id;
    const order = await createOrderService(userId);
    const message = "Order Created Successfully";
    apiResponse.success(res, order, message, 201);
  },
);

// Get My Orders Controller
export const getMyOrdersController = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id;
    const orders = await getMyOrdersService(userId);
    const message = "Orders Fetched Successfully";
    apiResponse.success(res, orders, message, 200);
  },
);

// Get Order By Id Controller
export const getOrderByIdController = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id;
    const { oid } = req.params;
    const order = await getOrderByIdService(userId, oid);
    const message = "Order Fetched Successfully";
    apiResponse.success(res, order, message, 200);
  },
);

// Cancel Order Controller
export const cancelOrderController = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id;
    const { oid } = req.params;
    const order = await cancelOrderService(userId, oid);
    const message = "Order Cancelled Successfully";
    apiResponse.success(res, order, message, 200);
  },
);

// Create Checkout Session Controller — turns an order into a Stripe payment link
export const createCheckoutSessionController = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id;
    const { oid } = req.params;
    const url = await createCheckoutSessionService(userId, oid);
    const message = "Checkout Session Created Successfully";
    apiResponse.success(res, { url }, message, 200);
  },
);
