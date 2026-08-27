import productModel from "@src/models/productModel";
import { userModel } from "@src/models/userModel";
import { CreateProductInput } from "@src/types/productTypes";
import AppError from "@src/utils/appError";

export const createProductService = async (
  body: CreateProductInput,
  id: string,
) => {
  const user = await userModel.findById(id);
  if (!user) {
    throw new AppError(404, "User not found with this id");
  }
  if (user.role !== "seller") {
    throw new AppError(401, "Only manufacturer can create product");
  }
  const product = await productModel.create({
    ...body,
    manufacturer_id: id,
  });
  return product;
};


// Get Product Service
export const getProductsService = async (id:string) => {
    if(!id){
      throw new AppError(404,"User not found")
    }
    const products = await productModel.find({manufacturer_id:id})
    return products;
}
