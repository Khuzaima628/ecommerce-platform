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
      seller_id: product.manufacturer_id,
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

  // Stock is only taken away once payment is confirmed (see
  // markOrderAsPaidService) — not here, so a failed/abandoned
  // checkout never leaves stock incorrectly reduced.

  // Cart is now turned into an order, so empty it.
  await cartProductModel.deleteMany({ userId });

  return order;
};

// Get Seller Orders Service
export const getSellerOrdersService = async (sellerId: string) => {
  const orders = await orderModel
    .find({ "items.seller_id": sellerId })
    .populate("userId", "name email")
    .sort("-createdAt");
  return orders;
};

// Seller Dashboard Stats Service
export const getSellerDashboardService = async (sellerId: string) => {
  const sellerObjectId = new Types.ObjectId(sellerId);

  const [totalProducts, lowStockProducts, orders] = await Promise.all([
    productModel.countDocuments({ manufacturer_id: sellerObjectId }),
    productModel.find({ manufacturer_id: sellerObjectId, stock: { $lt: 5, $gt: 0 } }, "productName stock"),
    orderModel.find({ "items.seller_id": sellerObjectId }),
  ]);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const waitingToShip = orders.filter(o => o.status === "paid").length;
  const revenue = orders
    .filter(o => o.paymentStatus === "paid")
    .reduce((sum, o) => {
      const sellerTotal = o.items
        .filter((item: any) => item.seller_id.toString() === sellerId)
        .reduce((s: number, item: any) => s + item.price * item.quantity, 0);
      return sum + sellerTotal;
    }, 0);

  return {
    totalProducts,
    totalOrders,
    pendingOrders,
    waitingToShip,
    revenue,
    lowStock: lowStockProducts.length,
    restockNote: lowStockProducts.map(p => ({ productName: p.productName, stock: p.stock })),
  };
};

// Update Order Status Service
export const updateOrderStatusService = async (sellerId: string, oid: string, status: string) => {
  const order = await orderModel.findById(oid);
  if (!order) throw new AppError(404, "Order not found");

  const isSeller = order.items.some((item: any) => item.seller_id.toString() === sellerId.toString());
  if (!isSeller) throw new AppError(403, "This order does not belong to you");

  const allowed = ["shipped", "delivered", "cancelled"];
  if (!allowed.includes(status)) throw new AppError(400, `Status must be one of: ${allowed.join(", ")}`);

  order.status = status as any;
  await order.save();
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

  // A pending order never had stock deducted (that only happens once
  // payment is confirmed), so cancelling it has nothing to give back.

  order.status = "cancelled";
  await order.save();
  return order;
};

export const createCheckoutSessionService = async (
  userId: string,
  oid: string,
) => {
  const order = await getOrderByIdService(userId, oid);

  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      managed_payments: { enabled: false },
      line_items: order.items.map((item: any) => ({
        price_data: {
          currency: "usd",
          product_data: { name: item.productName },
          unit_amount: item.price * 100, // Stripe wants cents, not dollars
        },
        quantity: item.quantity,
      })),
      success_url: "http://localhost:8080/customer/checkout/success",
      cancel_url: "http://localhost:8080/customer/checkout/cancel",
    },
    {
      idempotencyKey: `checkout-${order._id.toString()}`,
    },
  );

  order.stripeSessionId = session.id;
  await order.save();

  return session.url;
};

export const markOrderAsPaidService = async (sessionId: string) => {
  const order = await orderModel.findOne({ stripeSessionId: sessionId });

  if (!order) {
    // Don't throw here — Stripe doesn't care about our order matching,
    // it just needs a 200 so it stops retrying.
    console.error("No order found for Stripe session:", sessionId);
    return null;
  }

  order.status = "paid";
  order.paymentStatus = "paid";
  await order.save();

  // Stock leaves inventory only now that payment is actually confirmed.
  await Promise.all(
    order.items.map((item: { productId: Types.ObjectId; quantity: number }) =>
      productModel.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      }),
    ),
  );

  return order;
};
