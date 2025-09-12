import prisma from "@repo/db";
import { Request, Response, NextFunction } from "express";
import { ResponseUtil } from "@/utils/response.util";

export class PlanController {
  //GET /api/plans
  getPlans = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, search } = req.query;
      const whereClause: any = {};
      if (status) whereClause.isActive = status === "active";
      if (search)
        whereClause.OR = [
          { name: { contains: search as string, mode: "insensitive" } },
          { description: { contains: search as string, mode: "insensitive" } },
        ];
      const plans = await prisma.plan.findMany({ where: whereClause });
      ResponseUtil.success(res, plans, "Plans fetched successfully", 200);
    } catch (error) {
      next(error);
    }
  };
  //POST /api/plans
  createPlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        name,
        description,
        amount,
        currency,
        duration,
        features,
        isActive,
      } = req.body;
      if (!name || !amount || !duration) {
        ResponseUtil.error(res, "Missing required fields", 400);
      }
      const plan = await prisma.plan.create({
        data: {
          name,
          description,
          amount: parseFloat(amount),
          currency: currency || "INR",
          duration: parseInt(duration),
          features: features || [],
          isActive: isActive !== undefined ? isActive : true,
        },
      });
      ResponseUtil.success(res, plan, "Plan created successfully", 200);
    } catch (error) {
      next(error);
    }
  };

  //GET /api/plans/[id]
  getPlanById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const plan = await prisma.plan.findUnique({
        where: { id },
      });
      if (!plan) {
        ResponseUtil.error(res, "Plan not found", 404);
      }
      ResponseUtil.success(res, plan, "Plan fetched successfully", 200);
    } catch (error) {
      next(error);
    }
  };

  //PUT /api/plans/[id]
  updatePlanById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        amount,
        currency,
        duration,
        features,
        isActive,
      } = req.body;
      if (!name || !amount || !duration) {
        ResponseUtil.error(res, "Missing required fields", 400);
      }
      const plan = await prisma.plan.update({
        where: { id: id },
        data: {
          name,
          description,
          amount: parseFloat(amount),
          currency: currency || "INR",
          duration: parseInt(duration),
          features: features || [],
          isActive: isActive !== undefined ? isActive : true,
          updatedAt: new Date(),
        },
      });
      ResponseUtil.success(res, plan, "Plan updated successfully", 200);
    } catch (error) {
      next(error);
    }
  };

  //DELETE /api/plans/[id]
  deletePlanById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const existingPlan = await prisma.plan.findUnique({ where: { id } });
      if (!existingPlan) {
        ResponseUtil.error(res, "Plan not found", 404);
      }
      const activeSubscriptions = await prisma.subscription.count({
        where: { planId: id, status: "ACTIVE" },
      });
      if (activeSubscriptions > 0) {
        ResponseUtil.error(
          res,
          "Cannot delete plan with active subscriptions",
          400
        );
      }
      await prisma.plan.delete({ where: { id } });
      ResponseUtil.success(res, null, "Plan deleted successfully", 200);
    } catch (error) {
      next(error);
    }
  };
}
