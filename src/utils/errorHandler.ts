import type { ErrorRequestHandler } from "express";

interface ErrorDetails extends Error {
  statusCode?: number;
  status?: "fail" | "error";
  isOperational?: boolean;
}

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const appError = error as ErrorDetails;
  const statusCode = appError.statusCode || 500;
  const status = appError.status || "error";

  if (process.env.NODE_ENV === "development") {
    res.status(statusCode).json({
      success: false,
      message: appError.message,
      error: appError,
      stack: appError.stack,
    });
    return;
  }

  if (appError.isOperational) {
    res.status(statusCode).json({ success: false, message: appError.message });
    return;
  }

  console.error("ERROR:", error);
  res.status(500).json({ success: false, status, message: "Something went wrong" });
};

export default errorHandler;
