import multer from "multer";
import AppError from "@src/utils/appError";
import { MAX_FILE_SIZE, allowedTypes } from "@src/types/mediaTypes";

// Keep the file in memory (RAM). We send it to MinIO, we never save it on disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new AppError(400, `fileType must be one of [${allowedTypes}]`));
    }
    cb(null, true);
  },
});

// "file" is the field name the frontend must use in form-data
const uploadSingleImage = upload.array("file",5);

export default uploadSingleImage;
