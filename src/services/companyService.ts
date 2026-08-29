import companyModel from "@src/models/companyModel";
import { userModel } from "@src/models/userModel";
import AppError from "@src/utils/appError";
import { companyType } from "@src/types/companyType";

//  Get Company Service
export const getCompanyService = async (id: string) => {
  const user = await userModel.findById(id);
  if (!user) throw new AppError(404, "User not found");
  if (user.role !== "seller") {
    throw new AppError(401, "This route is not Belong to you");
  }
  const company = await companyModel.findOne({  manufacturer_id: id });
  if (!company) {
    throw new AppError(404, "Company not found");
  }
  return company;
};

// Create Company Service
export const createCompanyService = async (id: string, body: companyType) => {
  const user = await userModel.findById(id);
  const companyModal = await companyModel.findOne({ manufacturer_id: id });
  console.log("id".bgBlue, id);
  if (companyModal) throw new AppError(400, "Company already exist");
  if (!user) throw new AppError(404, "User not found");
  if (user.role !== "seller") {
    throw new AppError(401, "This route is not Belong to you");
  }
  if (!body) {
    throw new AppError(400, "Bad Request");
  }
  const { manufacturer_id, ...rest } = body;
  const company = await companyModel.create({ manufacturer_id: id, ...rest });
  return company;
};
