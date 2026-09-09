import { Types } from "mongoose";
import { orderModel } from "@src/models/orderModel";
import { cartProductModel } from "@src/models/cartProductModel";
import productModel from "@src/models/productModel";
import AppError from "@src/utils/appError";
import { stripe } from "@src/config/stripe";


export const createOrderService = async (userId: string) => {
  const cartItems = await cartProductModel
    .find({ userId })
    .populate("productId");

  if (cartItems.length === 0) {
    throw new AppError(400, "Your cart is empty");
  }

  for (const cartItem of cartItems) {
    const product = cartItem.productId as any;
    if (cartItem.quantity > product.stock) {
      throw new AppError(
        400,
        `${product.productName} only has ${product.stock} left in stock`,
      );
    }
  }

  const items = cartItems.map((cartItem) => {
    const product = cartItem.productId as any;
    return {
      productId: product._id,
      productName: product.productName,
      price: product.price,
      quantity: cartItem.quantity,
    };
  });

  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const order = await orderModel.create({
    userId,
    items,
    totalAmount,
  });

  // Reserve the stock now that the order exists.
  await Promise.all(
    items.map((item) =>
      productModel.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      }),
    ),
  );

  // Cart is now turned into an order, so empty it.
  await cartProductModel.deleteMany({ userId });

  return order;
};

// Get My Orders Service — newest first.
export const getMyOrdersService = async (userId: string) => {
  const orders = await orderModel.find({ userId }).sort("-createdAt");
  return orders;
};

// Get Order By Id Service
export const getOrderByIdService = async (userId: string, oid: string) => {
  if (!Types.ObjectId.isValid(oid)) {
    throw new AppError(400, "Invalid order id");
  }

  const order = await orderModel.findById(oid);
  if (!order) {
    throw new AppError(404, "Order not found");
  }
  if (order.userId.toString() !== userId.toString()) {
    throw new AppError(403, "This order does not belong to you");
  }
  return order;
};

// Cancel Order Service — only while still pending.
export const cancelOrderService = async (userId: string, oid: string) => {
  if (!Types.ObjectId.isValid(oid)) {
    throw new AppError(400, "Invalid order id");
  }

  const order = await orderModel.findById(oid);
  if (!order) {
    throw new AppError(404, "Order not found");
  }
  if (order.userId.toString() !== userId.toString()) {
    throw new AppError(403, "This order does not belong to you");
  }
  if (order.status !== "pending") {
    throw new AppError(400, "Only a pending order can be cancelled");
  }

  // Cancelling gives the stock back.
  await Promise.all(
    order.items.map((item: { productId: Types.ObjectId; quantity: number }) =>
      productModel.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      }),
    ),
  );

  order.status = "cancelled";
  await order.save();
  return order;
};

export const createCheckoutSessionService = async (userId: string, oid: string) => {
  const order = await getOrderByIdService(userId, oid);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: order.items.map((item:any) => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.productName },
        unit_amount: item.price * 100, // Stripe wants cents, not dollars
      },
      quantity: item.quantity,
    })),
    success_url: "http://localhost:5000/api/v1/order/success",
    cancel_url: "http://localhost:5000/api/v1/order/cancel",
  });

  order.stripeSessionId = session.id;
  await order.save();

  return session.url;
};
