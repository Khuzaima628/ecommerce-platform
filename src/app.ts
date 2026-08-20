import express from "express";
import morgan from "morgan";

import applySecurity from "@src/config/security";
import Routes from "@src/config/routes";
import AppError from "@src/utils/appError";
import globalErrorHandler from "@src/utils/errorHandler";

const app = express();

// 1. Request logging
app.use(morgan("dev"));

// 2. Security: helmet, body limits, sanitizing, hpp, rate limiting
applySecurity(app);

// 3. Application routes
Routes(app);

// 4. Anything unmatched becomes a 404 AppError
app.all("*", (req, _res, next) => {
  next(new AppError(404, `Route ${req.originalUrl} not found`));
});

// 5. Global error handler — always last
app.use(globalErrorHandler);

export default app;
