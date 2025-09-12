import { AuthenticatedRequest } from "@/middleware/auth.middleware";
import { Response, NextFunction } from "express";
import { v2 as cloudinary } from "cloudinary";
import { ResponseUtil } from "@/utils/response.util";
import ServerConfig from "@/config/server.config";
import prisma from "@/lib/prisma";

cloudinary.config({
  cloud_name: ServerConfig.cloudinary.cloud_name,
  api_key: ServerConfig.cloudinary.api_key,
  api_secret: ServerConfig.cloudinary.api_secret,
});

export class MiscController {
  uploadCloudinary = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { image, folder = "user-avatars", public_id } = req.body;
      if (!image) {
        ResponseUtil.error(res, "Image is required", 400);
      }
      const result = await cloudinary.uploader.upload(image, {
        folder,
        ...(public_id ? { public_id } : {}),
      });
      ResponseUtil.success(
        res,
        result.secure_url,
        "Image uploaded successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  };

  checkCoupon = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { coupon, planId } = req.query;
      if (!coupon) {
        ResponseUtil.error(res, "Coupon is required", 400);
      }
      if (!planId) {
        ResponseUtil.error(res, "Plan ID is required", 400);
      }
      const cpn = await prisma.promoCode.findFirst({
        where: {
          code: coupon as string,
          isActive: true,
          validUntil: {
            gte: new Date(),
          },
          applicablePlans: {
            some: {
              id: planId as string,
            },
          },
        },
        select: {
          id: true,
          code: true,
          discount: true,
        },
      });
      if (!cpn) {
        ResponseUtil.error(res, "Invalid or expired coupon code", 400);
      }
      ResponseUtil.success(res, cpn, "Coupon code is valid", 200);
    } catch (error) {
      next(error);
    }
  };
  checkPhoneNumber = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { phone } = req.body;
      if (!phone) {
        ResponseUtil.error(res, "Phone number is required", 400);
      }
      const user = await prisma.user.findUnique({
        where: { phone },
      });
      if (user) {
        ResponseUtil.error(res, "Phone number is already registered", 400);
      }
      ResponseUtil.success(res, null, "Phone number is available", 200);
    } catch (error) {
      next(error);
    }
  };
}
