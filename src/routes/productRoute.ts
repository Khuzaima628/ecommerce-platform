import { Router } from "express";
import { createProductConstroller,getProductsController } from "@src/controllers/productController";
import validateSchemaPayload from "@src/utils/validateSchemaPayload";
import { productValidation } from "@src/validations/productValidation";
import { protectMiddleware } from "@src/middlewares/protectMiddleware";

const productRoute = Router();

// Create Product Route
productRoute.post(
  "/product",
  protectMiddleware,
  validateSchemaPayload(productValidation),
  createProductConstroller,
);


// Get all Product Routes
productRoute.get("/products",protectMiddleware, getProductsController);

export default productRoute;
