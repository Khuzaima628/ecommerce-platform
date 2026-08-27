import { model, models, Schema, type InferSchemaType } from "mongoose";

enum Category {
  Stationary = "stationary",
  Books = "books",
  Art_Supplies = "art_supplies",
  Home_Goods = "home_goods",
  Apparel = "apparel",
}

enum Tag {
  HANDMADE = "handmade",
  BESTSELLER = "bestseller",
  LIMITED_STOCK = "limited_stock",
  SMALL_BATCH = "small_batch",
  RESTOCKED = "restocked",
  ARCHIVAL = "archival",
  GIFT_WRAPPED = "gift_wrapped",
}

const productSchema = new Schema(
  {
    manufacturer_id: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: [true, "Manufacturer ID is required"],
      index: true,
    },
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minLength: [3, "Minimum 3 characters long"],
      maxLength: [100, "Maximum 100 characters long"],
      index: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minLength: [5, "Minimum 5 characters long"],
      maxLength: [2000, "Maximum 2000 characters long"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      max: [999999.99, "Price exceeds maximum limit"],
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    category: {
      type: String,
      enum: Object.values(Category),
      required: [true, "Category is required"],
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      index: true,
      trim: true,
      uppercase: true,
    },
    tags: {
      type: [String],
      enum: Object.values(Tag),
      required: [true, "At least 1 tag is required"],
    },
    specifications: {
      type: [
        {
          label: {
            type: String,
            required: [true, "Specification label is required"],
            trim: true,
          },
          value: {
            type: String,
            required: [true, "Specification value is required"],
            trim: true,
          },
        },
      ],
      required: [true, "Specifications are required"],
      _id: false,
    },
    returns_note: {
      type: String,
      required: [true, "Return notes are required"],
      trim: true,
      minLength: [5, "Return notes must be at least 5 characters"],
    },
  },
  { timestamps: true },
);

type ProductType = InferSchemaType<typeof productSchema>;
const productModel =
  models.Product || model<ProductType>("Product", productSchema);

export default productModel;
export { ProductType, productSchema, Category, Tag };
