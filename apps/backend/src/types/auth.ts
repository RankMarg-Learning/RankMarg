import { z } from "zod";

// Sign-up validation schema
export const signUpSchema = z.object({
  fullname: z.string().min(1, "Full name is required"),
  username: z
    .string()
    .min(1, "Username is required")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username must contain only letters, numbers, or underscores"
    ),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long.")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter.")
    .regex(/\d/, "Password must contain at least one number."),
});

// Sign-in validation schema
export const signInSchema = z.object({
  username: z.string().min(1, "Email or username is required"),
  password: z.string().min(6, "Password is required"),
});

// Type definitions for auth data
export type SignUpData = z.infer<typeof signUpSchema>;
export type SignInData = z.infer<typeof signInSchema>;

// JWT payload types
export interface JwtPayload {
  id: string;
  plan?: {
    id?: string | null;
    status?: string;
    endAt?: Date | null;
  };
  examCode?: string;
  role?: string;
}

// Auth response types
export interface AuthResponse {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    username: string | null;
    avatar: string | null;
    role: string;
    examCode?: string;
    isNewUser: boolean;
    plan?: {
      id: string | null;
      status: string;
      endAt: Date | null;
    };
  };
  accessToken: string;
}
