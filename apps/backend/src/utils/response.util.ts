import { Response } from "express";
import { ApiResponse, PaginationMeta } from "../types/common";

export class ResponseUtil {
  static success<T>(
    res: Response,
    data: T,
    message: string = "Success",
    statusCode: number = 200,
    pagination?: PaginationMeta,
    cacheHeaders?: Record<string, string>
  ) {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
      ...(pagination && { pagination }),
    };

    // Apply cache headers if provided
    if (cacheHeaders) {
      res.set(cacheHeaders);
    }

    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    errorCode?: string,
    details?: unknown
  ) {
    const response: ApiResponse = {
      success: false,
      message,
      timestamp: new Date().toISOString(),
      ...(errorCode && { error: errorCode }),
      ...(details && { details }),
    };

    return res.status(statusCode).json(response);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    pagination: PaginationMeta,
    message: string = "Success",
    statusCode: number = 200,
    cacheHeaders?: Record<string, string>
  ) {
    return ResponseUtil.success(
      res,
      data,
      message,
      statusCode,
      pagination,
      cacheHeaders
    );
  }

  static created<T>(
    res: Response,
    data: T,
    message: string = "Resource created successfully"
  ) {
    return ResponseUtil.success(res, data, message, 201);
  }

  static updated<T>(
    res: Response,
    data: T,
    message: string = "Resource updated successfully"
  ) {
    return ResponseUtil.success(res, data, message, 200);
  }

  static deleted(
    res: Response,
    message: string = "Resource deleted successfully"
  ) {
    return ResponseUtil.success(res, null, message, 200);
  }

  static noContent(res: Response) {
    return res.status(204).send();
  }

  static cached<T>(
    res: Response,
    data: T,
    message: string = "Success",
    cacheMaxAge: number = 300, // 5 minutes default
    staleWhileRevalidate: number = 60 // 1 minute default
  ) {
    const cacheHeaders = {
      "Cache-Control": `private, max-age=${cacheMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
      Vary: "Authorization",
    };

    return ResponseUtil.success(
      res,
      data,
      message,
      200,
      undefined,
      cacheHeaders
    );
  }
}
