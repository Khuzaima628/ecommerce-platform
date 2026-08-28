import { ObjectId } from "mongoose";
import { Category, Tag } from "@src/models/productModel";

// Optional: Type for a single specification (reusable)
export interface Specification {
  label: string;
  value: string;
}

// For POST /products (Create)
export interface CreateProductInput {
  manufacturer_id: string | ObjectId; // or just string if you handle casting
  productName: string;
  description: string;
  price: number;
  stock: number;
  category: Category;
  sku: string;
  tags: Tag[];
  Specifications: Specification[];
  returns_note: string;
  image: string[];
}

// For PATCH /products/:id (Update)
export type UpdateProductInput = Partial<CreateProductInput>;

// Stock Type
export interface stockType {
    change:number
}
