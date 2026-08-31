import type { PipelineStage } from "mongoose";
import productModel from "@src/models/productModel";
import { userModel } from "@src/models/userModel";
import { CreateProductInput, stockType } from "@src/types/productTypes";
import AppError from "@src/utils/appError";

// Create Product
export const createProductService = async (
  body: CreateProductInput,
  id: string,
) => {
  const user = await userModel.findById(id);
  if (!user) {
    throw new AppError(404, "User not found with this id");
  }
  if (user.role !== "seller") {
    throw new AppError(401, "Only manufacturer can create product");
  }
  const sku = body.sku;
  const existingProduct = await productModel.findOne({ sku });
  if (existingProduct) {
    throw new AppError(400, "SKU already exists");
  }
  const product = await productModel.create({
    ...body,
    manufacturer_id: id,
  });
  return product;
};

// Get Product Service
export const getSellerProductsService = async (id: string) => {
  if (!id) {
    throw new AppError(404, "User not found");
  }
  const products = await productModel.find({ manufacturer_id: id });
  return products;
};

//Get Product by id
export const getProductByIdService = async (id: string, pid: string) => {
  const product = await productModel.findById(pid);
  console.log(pid, id);
  if (!product) {
    throw new AppError(404, "Product not found");
  }
  if (product.manufacturer_id.toString() !== id.toString()) {
    throw new AppError(403, "This product does not belong to you");
  }
  return product;
};

// Update Product
export const updateProductService = async (
  body: any,
  pid: string,
  id: string,
) => {
  const product = await productModel.findById(pid);

  if (!product) {
    throw new AppError(404, "Product not found");
  }

  if (product.manufacturer_id.toString() !== id.toString()) {
    throw new AppError(403, "This product does not belong to you");
  }

  if (body.sku) {
    const existingProduct = await productModel.findOne({
      sku: body.sku,
      _id: { $ne: pid },
    });

    if (existingProduct) {
      throw new AppError(
        409,
        "SKU already exists. Please choose a different SKU.",
      );
    }
  }

  const updatedProduct = await productModel.findByIdAndUpdate(
    pid,
    { ...body },
    { new: true, runValidators: true },
  );

  if (!updatedProduct) throw new AppError(404, "Product not found");
  return updatedProduct;
};

// Delete Product
export const deleteProductService = async (id: string, pid: string) => {
  const product = await productModel.findById(pid);
  console.log(pid, id);
  if (!product) {
    throw new AppError(404, "Product not found");
  }
  if (product.manufacturer_id.toString() !== id.toString()) {
    throw new AppError(403, "This product does not belong to you");
  }
  const deleteProduct = await productModel.findByIdAndDelete(pid);
  return null;
};

// Increase Stock Service
export const increseStockService = async (
  id: string,
  pid: string,
  body: stockType,
) => {
  const product = await productModel.findById(pid);
  if (!product) {
    throw new AppError(404, "Product not found");
  }
  if (product.manufacturer_id.toString() !== id.toString()) {
    throw new AppError(403, "This product does not belong to you");
  }
  const updateProduct = await productModel.findByIdAndUpdate(
    pid,
    { $inc: { stock: body.change } },
    { new: true },
  );
  return updateProduct;
};

// Hode Product Service
export const hideProductService = async (id: string, pid: string) => {
  const product = await productModel.findById(pid);
  if (!product) {
    throw new AppError(404, "Product not found");
  }
  if (product.manufacturer_id.toString() !== id.toString()) {
    throw new AppError(403, "This product does not belong to you");
  }
  if (product.isHidden === true) {
    product.isHidden = false;
  } else {
    product.isHidden = true;
  }
  await product.save();
  return null;
};

// =========================  CUSTOMER SERVICES   ===========================

// Base Pipeline 
const buildPipeline = (q: any): PipelineStage[] => {
  const match: Record<string, unknown> = { isHidden: false };
  const price: Record<string, number> = {};
  if (q.category) match.category = q.category;
  if (q.search) match.productName = { $regex: q.search, $options: "i" };
  if (q.minPrice) price.$gte = Number(q.minPrice);
  if (q.maxPrice) price.$lte = Number(q.maxPrice);
  if (Object.keys(price).length > 0) {
    match.price = price;
  }
  const page = Number(q.page) || 1;
  const limit = Number(q.limit) || 10;

  return [
    { $match: match },
    { $sort: { createdAt: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ];
};

export const getAllProductsService = async (id: string, query: any) => {
  const user = await userModel.findById(id);
  if (user.role === "seller") {
    console.log("Seller Accessing Products");
    throw new AppError(401, "Only customer can access this route");
  }

  const products = await productModel.aggregate(buildPipeline(query));
  console.log(JSON.stringify(buildPipeline(query), null, 2));
  return products;
};
