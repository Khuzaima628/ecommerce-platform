import route from "express";
import validateSchemaPayload from "@src/utils/validateSchemaPayload";
import { presignedUrlValidation } from "@src/validations/mediaValidation";
import { presignedUrlController } from "@src/controllers/mediaController";

const mediaRoute = route.Router();

// POST /api/v1/media/presigned-url
mediaRoute.post(
  "/presigned-url",
  validateSchemaPayload(presignedUrlValidation),
  presignedUrlController,
);

export default mediaRoute;
