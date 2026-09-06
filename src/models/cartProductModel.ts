import { models, model, Schema, type InferSchemaType } from "mongoose";

// Define the schema for the cart product
const cartProductSchems = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

type cartProductType = InferSchemaType<typeof cartProductSchems>;
const cartProductModel =
  models.product || model<cartProductType>("cartProduct", cartProductSchems);
export { cartProductType, cartProductModel };
