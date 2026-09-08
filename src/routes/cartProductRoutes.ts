import { Router } from "express";
import { cartProductValidation } from "@src/validations/cartProductValidation";
import { protectMiddleware } from "@src/middlewares/protectMiddleware";
import validateSchemaPayload from "@src/utils/validateSchemaPayload";
import {
  addToCartProductController,
  RemoveToCartProductController,
  getCartItemsController,updateCartItemController
} from "@src/controllers/cartProductController";

const cartProductRoute = Router();

// Add to Cart Route
cartProductRoute.post(
  "/cart/:productId",
  protectMiddleware,
  validateSchemaPayload(cartProductValidation),
  addToCartProductController,
);

// Remove from Cart Route
cartProductRoute.delete(  
  "/cart/:productId",
  protectMiddleware,
  RemoveToCartProductController,
);

// Get Cart Items Route
cartProductRoute.get(
  "/cart",
  protectMiddleware,
  getCartItemsController,
);

// Update Cart Item Route
cartProductRoute.put(
  "/cart/:productId",
  protectMiddleware,
  validateSchemaPayload(cartProductValidation),
  updateCartItemController,
);

export default cartProductRoute;
