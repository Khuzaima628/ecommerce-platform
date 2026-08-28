import { Router } from "express";
import {
  createProductConstroller,
  getProductsController,
  updateProductController,
  deleteProductController,
  getProductByIdController,
  increseStockController,
} from "@src/controllers/productController";
import validateSchemaPayload from "@src/utils/validateSchemaPayload";
import {
  productValidation,
  productUpdateValidation,
} from "@src/validations/productValidation";
import { protectMiddleware } from "@src/middlewares/protectMiddleware";

const productRoute = Router();

// Get all Product Routes
productRoute.get("/products", protectMiddleware, getProductsController);

// Increase Stock — must be before /product/:pid to avoid route conflict
productRoute.put(
  "/product/increase-stock/:pid",
  protectMiddleware,
  increseStockController,
);

// Create Product Route
productRoute.post(
  "/product",
  protectMiddleware,
  validateSchemaPayload(productValidation),
  createProductConstroller,
);

// Get Product by Id Route
productRoute.get("/product/:pid", protectMiddleware, getProductByIdController);

// Update Product
productRoute.patch(
  "/product/:pid",
  protectMiddleware,
  validateSchemaPayload(productUpdateValidation),
  updateProductController,
);

// Delete Product
productRoute.delete(
  "/product/:pid",
  protectMiddleware,
  deleteProductController,
);
export default productRoute;
