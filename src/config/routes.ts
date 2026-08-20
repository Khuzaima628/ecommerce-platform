import { Router, type Express } from "express";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "success", message: "API is running" });
});

// Feature routers get mounted here, e.g.:
// router.use("/auth", authRouter);
// router.use("/products", productRouter);

const mountRoutes = (app: Express): void => {
  app.use("/api/v1", router);
};

export default mountRoutes;
