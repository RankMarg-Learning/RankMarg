import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

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
    return NextResponse.json({ message: result.error.errors[0].message }, { status: 400 });
  }

  const { fullname, username, email, password } = result.data;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
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

    return NextResponse.json({ message: "User created" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

// Username availability check
export async function GET(req: Request) {
  const url = new URL(req.url);
  const username = url.searchParams.get("username");

  if (!username) {
    return NextResponse.json({ message: "Username is required" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    return NextResponse.json({ available: !user });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
