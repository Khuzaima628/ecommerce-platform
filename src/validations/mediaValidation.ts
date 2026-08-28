import joi from "joi";
import { folders, allowedTypes, MAX_FILE_SIZE } from "@src/types/mediaTypes";

const maxMb = MAX_FILE_SIZE / (1024 * 1024);

export const presignedUrlValidation = joi.object({
  fileName: joi.string().required().messages({
    "string.empty": "fileName cannot be empty",
    "any.required": "fileName is required",
  }),

  fileType: joi
    .string()
    .valid(...allowedTypes)
    .required()
    .messages({
      "any.only": `fileType must be one of [${allowedTypes}]`,
      "any.required": "fileType is required",
    }),

  fileSize: joi.number().positive().max(MAX_FILE_SIZE).required().messages({
    "number.base": "fileSize must be a number (bytes)",
    "number.max": `file must be smaller than ${maxMb} MB`,
    "any.required": "fileSize is required",
  }),

  folder: joi
    .string()
    .valid(...folders)
    .required()
    .messages({
      "any.only": `folder must be one of [${folders}]`,
      "any.required": "folder is required",
    }),
});
