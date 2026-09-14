import express from "express";
import morgan from "morgan";

import applySecurity from "@src/config/security";
import Routes from "@src/config/routes";
import webhookRoute from "@src/routes/webhookRoutes";
import AppError from "@src/utils/appError";
import globalErrorHandler from "@src/utils/errorHandler";
import connectDB from "@src/config/dbConnection";

const app = express();

// 0. Ensure DB is connected on every cold start
const MONGO_URI = process.env.MONGO_URI!;
app.use((_req, _res, next) => {
  connectDB(MONGO_URI).then(() => next()).catch(next);
});

// 1. Request logging
app.use(morgan("dev"));

app.use("/api/v1", webhookRoute);

// 3. Security: helmet, body limits, sanitizing, hpp, rate limiting
applySecurity(app);

// 4. Application routes
Routes(app);

// 5. Anything unmatched becomes a 404 AppError
app.all("*", (req, _res, next) => {
  next(new AppError(404, `Route ${req.originalUrl} not found`));
});

// 6. Global error handler — always last
app.use(globalErrorHandler);

export default app;
