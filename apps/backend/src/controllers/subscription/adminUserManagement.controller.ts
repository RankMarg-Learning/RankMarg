import prisma from "@repo/db";
import { Request, Response, NextFunction } from "express";
import { ResponseUtil } from "@/utils/response.util";
import { Role } from "@repo/db/enums";

export class AdminUserManagementController {
  /**
   * Get user details by unified search (searches through id, name, username, email, phone, location)
   */
  getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { search } = req.query;

      if (!search || !search.toString().trim()) {
        ResponseUtil.error(res, "Please provide a search value", 400);
        return;
      }

      const searchTerm = search.toString().trim();

      // Build where clause with OR conditions to check all fields
      const whereClause: any = {
        OR: [
          { id: searchTerm },
          { username: { contains: searchTerm, mode: "insensitive" } },
          { email: { contains: searchTerm, mode: "insensitive" } },
          { phone: { contains: searchTerm, mode: "insensitive" } },
          { location: { contains: searchTerm, mode: "insensitive" } },
          { name: { contains: searchTerm, mode: "insensitive" } },
        ],
      };

      const user = await prisma.user.findFirst({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          avatar: true,
          phone: true,
          role: true,
          subscription: {
            include: {
              plan: true,
            },
          },
        },
      });

      if (!user) {
        ResponseUtil.error(res, "User not found", 404);
        return;
      }

      ResponseUtil.success(
        res,
        user,
        "User fetched successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update user role
   */
  updateUserRole = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId } = req.query;
      const { role } = req.body;

      if (!userId) {
        ResponseUtil.error(res, "Please provide userId", 400);
        return;
      }

      if (!role || !Object.values(Role).includes(role)) {
        ResponseUtil.error(res, "Invalid role", 400);
        return;
      }

      const user = await prisma.user.findUnique({ where: { id: userId as string } });

      if (!user) {
        ResponseUtil.error(res, "User not found", 404);
        return;
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { role },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          role: true,
        },
      });

      ResponseUtil.success(
        res,
        updatedUser,
        "User role updated successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update multiple user fields
   */
  updateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId } = req.query;
      const updates = req.body;

      if (!userId) {
        ResponseUtil.error(res, "Please provide userId", 400);
        return;
      }

      // Remove fields that shouldn't be updated directly
      const { id, password, ...allowedUpdates } = updates;

      const user = await prisma.user.findUnique({ where: { id: userId as string } });

      if (!user) {
        ResponseUtil.error(res, "User not found", 404);
        return;
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: allowedUpdates,
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          avatar: true,
          phone: true,
          role: true,
          standard: true,
          targetYear: true,
          studyHoursPerDay: true,
        },
      });

      ResponseUtil.success(
        res,
        updatedUser,
        "User updated successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  };
}
