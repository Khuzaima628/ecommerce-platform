import { model, models, type InferSchemaType, Schema } from "mongoose";

// Define the schema for the favourite product
const favouriteProductSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      required: [true, "User Id is required"],
    },
    product_id: {
      type: Schema.Types.ObjectId,
      required: [true, "Product Id is required"],
    },
  },
  { timestamps: true },
);

// Create a virtual field to populate the product details
favouriteProductSchema.virtual("product", {
  ref: "Product",
  localField: "product_id",
  foreignField: "_id",
  justOne: true,
});
favouriteProductSchema.set("toJSON", { virtuals: true });
favouriteProductSchema.set("toObject", { virtuals: true });


type favouriteProductType = InferSchemaType<typeof favouriteProductSchema>;
const favouriteProductModel =
  models.FavouriteProduct || model("FavouriteProduct", favouriteProductSchema);
export { favouriteProductModel, type favouriteProductType };
