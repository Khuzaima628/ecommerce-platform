import route from "express";
import { uploadController } from "@src/controllers/mediaController";
import uploadSingleImage from "@src/middlewares/uploadMiddleware";

// Router instance for media
const mediaRoute = route.Router();

// POST /api/v1/media/presigned-url — the only upload endpoint in the app
mediaRoute.post("/presigned-url", uploadSingleImage, uploadController);

export default mediaRoute;
