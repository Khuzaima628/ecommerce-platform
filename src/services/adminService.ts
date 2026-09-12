import { userModel } from "@src/models/userModel";
import { orderModel } from "@src/models/orderModel";
import productModel from "@src/models/productModel";
import AppError from "@src/utils/appError";

export const getAllOrdersService = async (id: string, status: string) => {
  const user = await userModel.findById(id);
  if (!user) throw new AppError(404, "User not found");
  if (user.role !== "admin") throw new AppError(403, "Access Denied");

  let orders;
  if (status) {
    orders = await orderModel.find({ status }).populate("userId", "name email").sort("-createdAt");
  } else {
    orders = await orderModel.find().populate("userId", "name email").sort("-createdAt");
  }
  return orders;
};

export const getAllUsersService = async (id: string, role: string) => {
  const user = await userModel.findById(id);
  if (!user) throw new AppError(404, "User not found");
  if (user.role !== "admin") throw new AppError(403, "Access Denied");

  let users;
  if (role) {
    users = await userModel.find({ role });
  } else {
    users = await userModel.find();
  }
  return users;
};

export const getAllProductsAdminService = async (id: string, query: Record<string, any>) => {
  const user = await userModel.findById(id);
  if (!user) throw new AppError(404, "User not found");
  if (user.role !== "admin") throw new AppError(403, "Access Denied");

  const filter: Record<string, any> = {};
  if (query.search) filter.productName = { $regex: query.search, $options: "i" };
  if (query.category) filter.category = query.category;
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }
  if (query.isHidden !== undefined) filter.isHidden = query.isHidden === "true";

  const products = await productModel.find(filter).sort("-createdAt");
  return products;
};
