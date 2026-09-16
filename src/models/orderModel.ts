import { models, model, Schema, type InferSchemaType } from "mongoose";

// One product line inside an order — a snapshot, not a live reference.
// Price is copied at order time so it never changes even if the product price changes later.
const orderItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    seller_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    // Each seller fulfills their own line independently — one order can
    // hold items from several sellers, and one seller marking their item
    // "shipped" must never change another seller's item on the same order.
    status: {
      type: String,
      enum: ["pending", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    // Whole-checkout status, before payment: lets the customer cancel the
    // entire order while it's still pending. Once paid, fulfillment is
    // tracked PER ITEM instead (see items[].status above), since a single
    // order can span multiple sellers who ship independently.
    status: {
      type: String,
      enum: ["pending", "paid", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },
    stripeSessionId: {
      type: String,
    },
  },
  { timestamps: true },
);

type orderType = InferSchemaType<typeof orderSchema>;
const orderModel = models.Order || model<orderType>("Order", orderSchema);

export { orderModel, type orderType };
