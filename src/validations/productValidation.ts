import joi from "joi";
import { Category, Tag } from "@src/models/productModel";

// One specification row: { label, value }
const specificationItem = joi.object({
  label: joi.string().trim().required().messages({
    "any.required": "Label is required",
    "string.empty": "Label cannot be empty",
  }),
  value: joi.string().trim().required().messages({
    "any.required": "Value is required",
    "string.empty": "Value cannot be empty",
  }),
});

// Create Product Validation
export const productValidation = joi.object({
  productName: joi.string().trim().min(3).max(100).required().messages({
    "any.required": "Product name is required",
    "string.empty": "Product name cannot be empty",
    "string.min": "Product name should have minimum 3 characters",
    "string.max": "Product name should have maximum 100 characters",
  }),

  description: joi.string().trim().min(5).max(2000).required().messages({
    "any.required": "Description is required",
    "string.empty": "Description cannot be empty",
    "string.min": "Description should have minimum 5 characters",
    "string.max": "Description should have maximum 2000 characters",
  }),

  price: joi.number().min(1).max(999999.99).required().messages({
    "any.required": "Price is required",
    "number.base": "Price should be a number",
    "number.min": "Price should be greater than 1",
    "number.max": "Price exceeds maximum limit",
  }),

  stock: joi.number().min(0).required().messages({
    "any.required": "Stock is required",
    "number.base": "Stock should be a number",
    "number.min": "Stock cannot be negative",
  }),

  category: joi
    .string()
    .valid(...Object.values(Category))
    .required()
    .messages({
      "any.required": "Category is required",
      "any.only":
        "Category must be one of: " + Object.values(Category).join(", "),
    }),

  sku: joi.string().trim().uppercase().min(3).max(50).required().messages({
    "any.required": "SKU is required",
    "string.empty": "SKU cannot be empty",
    "string.min": "SKU should have minimum 3 characters",
    "string.max": "SKU should have maximum 50 characters",
  }),

  tags: joi
    .array()
    .items(joi.string().valid(...Object.values(Tag)))
    .min(1)
    .required()
    .messages({
      "any.required": "Tags are required",
      "array.min": "At least 1 tag is required",
      "array.base": "Tags must be an array",
      "any.only": "Invalid tag value",
    }),

  specifications: joi.array().items(specificationItem).required().messages({
    "any.required": "Specifications are required",
    "array.base": "Specifications must be an array",
  }),

  returns_note: joi.string().trim().min(5).required().messages({
    "any.required": "Return notes are required",
    "string.empty": "Return notes cannot be empty",
    "string.min": "Return notes must be at least 5 characters",
  }),
});

// Product Update Validation — same rules, nothing required
export const productUpdateValidation = joi
  .object({
    productName: joi.string().trim().min(3).max(100).messages({
      "string.empty": "Product name cannot be empty",
      "string.min": "Product name should have minimum 3 characters",
      "string.max": "Product name should have maximum 100 characters",
    }),

    description: joi.string().trim().min(5).max(2000).messages({
      "string.empty": "Description cannot be empty",
      "string.min": "Description should have minimum 5 characters",
      "string.max": "Description should have maximum 2000 characters",
    }),

    price: joi.number().min(1).max(999999.99).messages({
      "number.base": "Price should be a number",
      "number.min": "Price should be greater than 1",
      "number.max": "Price exceeds maximum limit",
    }),

    stock: joi.number().min(0).messages({
      "number.base": "Stock should be a number",
      "number.min": "Stock cannot be negative",
    }),

    category: joi
      .string()
      .valid(...Object.values(Category))
      .messages({
        "any.only":
          "Category must be one of: " + Object.values(Category).join(", "),
      }),

    sku: joi.string().trim().uppercase().min(3).max(50).messages({
      "string.empty": "SKU cannot be empty",
      "string.min": "SKU should have minimum 3 characters",
      "string.max": "SKU should have maximum 50 characters",
    }),

    tags: joi
      .array()
      .items(joi.string().valid(...Object.values(Tag)))
      .min(1)
      .messages({
        "array.min": "At least 1 tag is required",
        "array.base": "Tags must be an array",
        "any.only": "Invalid tag value",
      }),

    specifications: joi.array().items(specificationItem).messages({
      "array.base": "Specifications must be an array",
    }),

    returns_note: joi.string().trim().min(5).messages({
      "string.empty": "Return notes cannot be empty",
      "string.min": "Return notes must be at least 5 characters",
    }),
  })
  .min(1)
  .messages({
    "object.min": "Send at least one field to update",
  });
