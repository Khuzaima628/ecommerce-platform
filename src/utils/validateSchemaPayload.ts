import type { ObjectSchema } from "joi";
import AppError from "@src/utils/appError";
import catchAsync from "@src/utils/catchAsync";

const validateSchemaPayload = (schema: ObjectSchema) =>
  catchAsync(async (req, _res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const message = error.details.map((detail) => detail.message).join(", ");
      return next(new AppError(400, message));
    }

    req.body = value;
    next();
  });

export default validateSchemaPayload;
