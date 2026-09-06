import { cartProductModel } from "@src/models/cartProductModel";
import productModel from "@src/models/productModel";
import { cartProductType } from "@src/models/cartProductModel";
import { userModel } from "@src/models/userModel";
import AppError from "@src/utils/appError";

// Add to Cart Service
export const addToCartService = async (
  userId: string,
  productId: string,
  body: cartProductType,
) => {
  const existingCartItem = await cartProductModel.findOne({
    userId: userId,
    productId: productId,
  });
  if (existingCartItem) {
    throw new AppError(400, "Item already exist in cart");
  }
  const user = await userModel.findById(userId);
  if (!user) {
    throw new AppError(400, "User not found");
  }
  const product = await productModel.findById(productId);
  console.log(product.stock);
  if (!product) {
    throw new AppError(400, "Product not found");
  }
  if (body.quantity > product.stock) {
    throw new AppError(400, "Quantity exceeds available stock");
  }
  const addToCartProduct = await cartProductModel.create({
    ...body,
    userId: userId,
    productId: productId,
  });
  return addToCartProduct;
};

// Remove from Cart Service
export const removeFromCartService = async (
  userId: string,
  productId: string,
) => {
  const existingCartItem = await cartProductModel.findOne({
    userId: userId,
    productId: productId,
  });
  if (!existingCartItem) {
    throw new AppError(400, "Item not found in cart");
  }
  const user = await userModel.findById(userId);
  if (!user) {
    throw new AppError(400, "User not found");
  }
  await cartProductModel.findOneAndDelete({
    userId,
    productId,
  });
  return null;
};

// Get Cart Items Service
export const getCartItemsService = async (userId: string) => {
  const cartItems = await cartProductModel
    .find({ userId })
    .populate("productId");
  return cartItems;
};

// Update Cart Item Service
export const updateCartItemService = async (
  userId: string,
  productId: string,
  body: cartProductType,
) => {
  const existingCartItem = await cartProductModel.findOne({
    userId: userId,
    productId: productId,
  });
  if (!existingCartItem) {
    throw new AppError(400, "Item not found in cart");
  }
  const product = await productModel.findById(productId);
  if (!product) {
    throw new AppError(400, "Product not found");
  }
  if (body.quantity > product.stock) {
    throw new AppError(400, "Quantity exceeds available stock");
  }
  const updatedCartItem = await cartProductModel.findOneAndUpdate(
    { userId, productId },
    { ...body },
    { new: true },
  );
  return updatedCartItem;
};
