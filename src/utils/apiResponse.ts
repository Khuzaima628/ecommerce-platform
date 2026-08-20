import type { Response } from "express";

const apiResponse = {
  success: (res: Response, data: unknown, message = "Success", statusCode = 200): void => {
    res.status(statusCode).json({ success: true, message, data });
  },

  error: (res: Response, message = "Error", statusCode = 400, errors: unknown = null): void => {
    res.status(statusCode).json({ success: false, message, errors });
  },
};

export default apiResponse;
