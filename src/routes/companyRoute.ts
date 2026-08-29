import { Router } from "express";
import validateSchemaPayload from "@src/utils/validateSchemaPayload";
import {
  createCompanyController,
  getCompanyController,
} from "@src/controllers/companyController";
import { protectMiddleware } from "@src/middlewares/protectMiddleware";
import { companyValidation } from "@src/validations/companyValidation";

export const companyRoute = Router();

// Get Company Route
companyRoute.get("/company", protectMiddleware, getCompanyController);

// Create Company Route
companyRoute.post(
  "/company",
  protectMiddleware,
  validateSchemaPayload(companyValidation),
  createCompanyController,
);

export default companyRoute;
