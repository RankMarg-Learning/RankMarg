import { AuthenticatedRequest } from "@/middleware/auth.middleware";
import { Response, NextFunction } from "express";
import { v2 as cloudinary } from "cloudinary";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { ResponseUtil } from "@/utils/response.util";
import ServerConfig from "@/config/server.config";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

cloudinary.config({
  cloud_name: ServerConfig.cloudinary.cloud_name,
  api_key: ServerConfig.cloudinary.api_key,
  api_secret: ServerConfig.cloudinary.api_secret,
});

const s3Client = new S3Client({
  region: ServerConfig.s3.region,
  credentials: {
    accessKeyId: ServerConfig.s3.accessKeyId!,
    secretAccessKey: ServerConfig.s3.secretAccessKey!,
  },
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

  uploadS3 = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { image, folder = "question-images", fileName } = req.body;
      if (!image) {
        ResponseUtil.error(res, "Image is required", 400);
        return;
      }

      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      const extension = image.split(";")[0].split("/")[1];
      const uniqueFileName = fileName
        ? `${fileName}.${extension}`
        : `${uuidv4()}.${extension}`;

      const s3Key = folder ? `${folder}/${uniqueFileName}` : uniqueFileName;

      const command = new PutObjectCommand({
        Bucket: ServerConfig.s3.bucket,
        Key: s3Key,
        Body: buffer,
        ContentEncoding: "base64",
        ContentType: `image/${extension}`,
      });

      await s3Client.send(command);

      const publicUrl = `https://cdn.rankmarg.in/${s3Key}`;

      ResponseUtil.success(res, publicUrl, "Image uploaded successfully", 200);
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
          maxUsageCount: true,
          currentUsageCount: true,
        },
      });
      if (!cpn) {
        ResponseUtil.error(res, "Invalid or expired coupon code", 400);
      }
      if (cpn.maxUsageCount && cpn.currentUsageCount >= cpn.maxUsageCount) {
        ResponseUtil.error(res, "Coupon code has reached the maximum usage limit", 400);
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
