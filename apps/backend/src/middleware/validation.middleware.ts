import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ApiError, ErrorCode } from "../types/common";

export interface ValidatedRequest<TQuery = any, TBody = any, TParams = any>
  extends Request {
  validatedQuery?: TQuery;
  validatedBody?: TBody;
  validatedParams?: TParams;
}

export const validateQuery = <T>(schema: z.ZodSchema<T>) => {
  return (req: ValidatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.query);

      if (!result.success) {
        throw new ApiError(
          ErrorCode.VALIDATION_ERROR,
          "Invalid query parameters",
          400,
          result.error.format()
        );
      }

      req.validatedQuery = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateBody = <T>(schema: z.ZodSchema<T>) => {
  return (req: ValidatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        throw new ApiError(
          ErrorCode.VALIDATION_ERROR,
          "Invalid request body",
          400,
          result.error.format()
        );
      }

      req.validatedBody = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateParams = <T>(schema: z.ZodSchema<T>) => {
  return (req: ValidatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.params);

      if (!result.success) {
        throw new ApiError(
          ErrorCode.VALIDATION_ERROR,
          "Invalid URL parameters",
          400,
          result.error.format()
        );
      }

      req.validatedParams = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};
