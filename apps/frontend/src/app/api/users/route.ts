import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { jsonResponse } from "@/utils/api-response";

const userSchema = z.object({
  fullname: z.string().min(1, "Full name is required"),
  username: z
    .string()
    .min(1, "Username is required")
    .regex(/^[a-zA-Z0-9_]+$/, "Username must contain only letters, numbers, or underscores"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export async function POST(req: Request) {
  const body = await req.json();
  const result = userSchema.safeParse(body);

  if (!result.success) {
    return jsonResponse(null, { success: false, message: result.error.errors[0].message, status: 400 });
  }
  const { fullname, username, email, password } = result.data;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return jsonResponse(null, { success: false, message: "Email already exists", status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

     await prisma.user.create({
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

    return jsonResponse(null, { success: true, message: "User created successfully", status: 201 });
  } catch (error) {
    console.error(error);
    return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 });
  }
}

export async function GET() {
  try {
    const user = await prisma.user.findMany()
    return jsonResponse(user, { success: true, message: "User fetched successfully", status: 200 });
  } catch (error) {
    console.error(error);
    return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 });
  }
}
