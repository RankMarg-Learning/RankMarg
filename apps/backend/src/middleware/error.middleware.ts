import { Request, Response, NextFunction } from "express";
import { ApiError, ErrorCode, ApiResponse } from "../types/common";
import { ServerConfig } from "../config/server.config";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isDevelopment = ServerConfig.nodeEnv === "development";

  // Log error
  console.error("API Error:", {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    timestamp: new Date().toISOString(),
  });

  let statusCode = 500;
  let errorCode = ErrorCode.INTERNAL_ERROR;
  let message = "Internal server error";
  let details: unknown = undefined;

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    errorCode = error.code;
    message = error.message;
    details = error.details;
  } else if (error.name === "ValidationError") {
    statusCode = 400;
    errorCode = ErrorCode.VALIDATION_ERROR;
    message = error.message;
  } else if (error.name === "UnauthorizedError") {
    statusCode = 401;
    errorCode = ErrorCode.UNAUTHORIZED;
    message = "Unauthorized";
  } else if (error.message.includes("ECONNREFUSED")) {
    statusCode = 503;
    errorCode = ErrorCode.INTERNAL_ERROR;
    message = "Database connection failed";
  }

  const response: ApiResponse = {
    success: false,
    message,
    error: errorCode,
    timestamp: new Date().toISOString(),
    ...(details && { details }),
    ...(isDevelopment && { stack: error.stack }),
  };

  res.status(statusCode).json(response);
};

export const notFoundHandler = (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
    error: ErrorCode.NOT_FOUND,
    timestamp: new Date().toISOString(),
  };

  res.status(404).json(response);
};
