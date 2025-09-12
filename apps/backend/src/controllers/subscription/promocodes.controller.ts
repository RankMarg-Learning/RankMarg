import prisma from "@repo/db";
import { Request, Response, NextFunction } from "express";
import { ResponseUtil } from "@/utils/response.util";

export class PromocodesController {
  //GET /api/promocodes
  getPromocodes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, search } = req.query;
      let whereClause: any = {};

      if (status && status !== "all") {
        whereClause.isActive = status === "active";
      }

      if (search) {
        whereClause.OR = [
          { code: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      const promoCodes = await prisma.promoCode.findMany({
        where: whereClause,
        include: {
          applicablePlans: true,
        },
        orderBy: { createdAt: "desc" },
      });
      if (!promoCodes) {
        ResponseUtil.error(res, "Promocodes not found", 404);
      }
      ResponseUtil.success(
        res,
        promoCodes,
        "Promocodes fetched successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  };

  //POST /api/promocodes
  createPromocode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        code,
        description,
        discount,
        maxUsageCount,
        validFrom,
        validUntil,
        isActive,
        applicablePlans,
      } = req.body;

      if (!code || !discount || !validFrom || !validUntil) {
        ResponseUtil.error(res, "Missing required fields", 400);
      }

      const existingCode = await prisma.promoCode.findUnique({
        where: { code: code.toUpperCase() },
      });
      if (existingCode) {
        ResponseUtil.error(res, "Promo code already exists", 400);
      }
      if (new Date(validFrom) >= new Date(validUntil)) {
        ResponseUtil.error(
          res,
          "Valid until date must be after valid from date",
          400
        );
      }
      const promoCode = await prisma.promoCode.create({
        data: {
          code: code.toUpperCase(),
          description,
          discount: parseFloat(discount),
          maxUsageCount: maxUsageCount ? parseInt(maxUsageCount) : null,
          currentUsageCount: 0,
          validFrom: new Date(validFrom),
          validUntil: new Date(validUntil),
          isActive: isActive !== undefined ? isActive : true,
          applicablePlans: {
            connect:
              applicablePlans?.map((plan: any) => ({
                id: typeof plan === "string" ? plan : plan.id,
              })) || [],
          },
        },
        include: {
          applicablePlans: true,
        },
      });
      ResponseUtil.success(
        res,
        promoCode,
        "Promo code created successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  };

  //GET /api/promocodes/[id]
  getPromocodeById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const promoCode = await prisma.promoCode.findUnique({
        where: { id: id },
        include: {
          applicablePlans: true,
        },
      });
      if (!promoCode) {
        ResponseUtil.error(res, "Promo code not found", 404);
      }
      ResponseUtil.success(
        res,
        promoCode,
        "Promo code fetched successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  };

  //PUT /api/promocodes/[id]
  updatePromocodeById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const {
        code,
        description,
        discount,
        maxUsageCount,
        validFrom,
        validUntil,
        isActive,
        applicablePlans,
      } = req.body;
      if (!code || !discount || !validFrom || !validUntil) {
        ResponseUtil.error(res, "Missing required fields", 400);
      }
      const existingCode = await prisma.promoCode.findFirst({
        where: {
          code: code.toUpperCase(),
          id: { not: id },
        },
      });
      if (existingCode) {
        ResponseUtil.error(res, "Promo code already exists", 400);
      }
      if (new Date(validFrom) >= new Date(validUntil)) {
        ResponseUtil.error(
          res,
          "Valid until date must be after valid from date",
          400
        );
      }
      const promoCode = await prisma.promoCode.update({
        where: { id: id },
        data: {
          code: code.toUpperCase(),
          description,
          discount: parseFloat(discount),
          maxUsageCount: maxUsageCount ? parseInt(maxUsageCount) : null,
          validFrom: new Date(validFrom),
          validUntil: new Date(validUntil),
          isActive: isActive !== undefined ? isActive : true,
          applicablePlans: {
            set: [], // Clear existing connections
            connect:
              applicablePlans?.map((plan: any) => ({
                id: typeof plan === "string" ? plan : plan.id,
              })) || [],
          },
          updatedAt: new Date(),
        },
        include: {
          applicablePlans: true,
        },
      });
      ResponseUtil.success(
        res,
        promoCode,
        "Promo code updated successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  };

  //DELETE /api/promocodes/[id]
  deletePromocodeById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const existingPromoCode = await prisma.promoCode.findUnique({
        where: { id: id },
      });
      if (!existingPromoCode) {
        ResponseUtil.error(res, "Promo code not found", 404);
      }
      await prisma.promoCode.delete({ where: { id: id } });
      ResponseUtil.success(res, null, "Promo code deleted successfully", 200);
    } catch (error) {
      next(error);
    }
  };
}
