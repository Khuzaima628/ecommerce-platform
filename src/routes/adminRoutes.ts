import { Router } from "express";
import { protectMiddleware } from "@src/middlewares/protectMiddleware";
import { getAllOrdersController, getAllUsersController, getAllProductsAdminController } from "@src/controllers/adminController";

const adminRoute = Router();

// Get All Orders
adminRoute.get("/orders", protectMiddleware, getAllOrdersController);

// Get All Users
adminRoute.get("/users", protectMiddleware, getAllUsersController);

// Get All Products
adminRoute.get("/products", protectMiddleware, getAllProductsAdminController);

export default adminRoute;
