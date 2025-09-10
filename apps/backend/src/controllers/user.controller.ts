import { AuthenticatedRequest } from "@/middleware/auth.middleware";
import { ResponseUtil } from "@/utils/response.util";
import prisma from "@repo/db";
import { NextFunction, Response, Request } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";

const userSchema = z.object({
  fullname: z.string().min(1, "Full name is required"),
  username: z
    .string()
    .min(1, "Username is required")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username must contain only letters, numbers, or underscores"
    ),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});
export const userController = {
  getUsers: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = await prisma.user.findMany();
      ResponseUtil.success(res, user, "Users fetched successfully", 200);
    } catch (error) {
      next(error);
    }
  },

  //NO need of next function here because anyone create the users when it is logged in
  createUser: async (req: Request, res: Response) => {
    try {
      const body = await req.body;
      const result = userSchema.safeParse(body);
      if (!result.success) {
        ResponseUtil.error(res, result.error.errors[0].message, 400);
        return;
      }
      const { fullname, username, email, password } = result.data;
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        ResponseUtil.error(res, "User already exists", 400);
        return;
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          name: fullname,
          username,
          email,
          password: hashedPassword,
          provider: "credentials",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      await prisma.subscription.create({
        data: {
          user: { connect: { id: user.id } },
          status: "TRIAL",
          provider: "NONE",
          duration: 30,
          amount: 0,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
        },
      });
      ResponseUtil.success(res, null, "User created successfully", 201);
    } catch (error) {
      ResponseUtil.error(res, "Internal Server Error", 500);
    }
  },
};
