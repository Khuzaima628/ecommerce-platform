import { Router } from "express";
import { protectMiddleware } from "@src/middlewares/protectMiddleware";
import {
  createOrderController,
  getMyOrdersController,
  getOrderByIdController,
  cancelOrderController,
  createCheckoutSessionController,
} from "@src/controllers/orderController";

const orderRoute = Router();

// Create Order Route — checkout the current cart
orderRoute.post("/order", protectMiddleware, createOrderController);

// Get My Orders Route
orderRoute.get("/order", protectMiddleware, getMyOrdersController);

// Cancel Order Route — fixed path BEFORE the dynamic /order/:oid
orderRoute.patch(
  "/order/:oid/cancel",
  protectMiddleware,
  cancelOrderController,
);

// Checkout Route — turns an order into a Stripe payment link
orderRoute.post(
  "/order/:oid/checkout",
  protectMiddleware,
  createCheckoutSessionController,
);

// Get Order By Id Route
orderRoute.get("/order/:oid", protectMiddleware, getOrderByIdController);

export default orderRoute;
