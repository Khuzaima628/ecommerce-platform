import catchAsync from "@src/utils/catchAsync";
import apiResponse from "@src/utils/apiResponse";
import { Response, Request } from "express";
import { addToCartService,removeFromCartService,getCartItemsService,updateCartItemService } from "@src/services/cartProductService";

// Add to Cart Controller
export const addToCartProductController = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id;
    const productId = req.params.productId;
    const body = req.body;
    const addProduct = await addToCartService(userId, productId, body);
    const message = "Product Added to Cart Successfully";
    apiResponse.success(res, addProduct, message, 200);
  },
);

// Add to Cart Controller
export const RemoveToCartProductController = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id;
    const productId = req.params.productId;
    const addProduct = await removeFromCartService(userId, productId);
    const message = "Product Deelted to Cart Successfully";
    apiResponse.success(res, addProduct, message, 204);
  },
);

// Get Cart Items Controller
export const getCartItemsController = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id;
    const cartItems = await getCartItemsService(userId);
    const message = "Cart Items Fetched Successfully";
    apiResponse.success(res, cartItems, message, 200);
  },
);

// Update Cart Item Controller
export const updateCartItemController = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id;
    const productId = req.params.productId;
    const body = req.body;
    const updatedCartItem = await updateCartItemService(userId, productId, body);
    const message = "Cart Item Updated Successfully";
    apiResponse.success(res, updatedCartItem, message, 200);
  },
);
