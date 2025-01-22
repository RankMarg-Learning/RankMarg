"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// Define Zod schema for validation
const signInSchema = z.object({
  username: z
    .string()
    .min(1, "Email or username is required"),
  password: z
    .string().min(6, "Password is required"),
});

const SignInForm = () => {
  const [msg, setMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signInSchema),
  });

  const router = useRouter();

  const handleLogin = async (data: { username: string; password: string }) => {
    try {
      const result = await signIn("credentials", {
        email: data.username,
        password: data.password,
        redirect: false,
      });
      if (result?.error) {
        setMsg("Invalid username or password");
      } else {
        router.push("/tests");
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("An unexpected error occurred. Please try again later.");
    }
  };
  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const lowercaseUsername = event.target.value.toLowerCase();
    setValue("username", lowercaseUsername, { shouldValidate: true });
  };
  

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-full max-w-md">
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your email or username and password to log in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleLogin)}>
              <div className="grid gap-2">
                <Label htmlFor="email">Email or Username</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="Email or Username"
                  {...register("username")}
                  onChange={handleUsernameChange}
                />
                {errors.username && (
                  <p className="text-red-500 text-sm">{errors.username?.message?.toString()}</p>
                )}
              </div>

              <div className="grid gap-2 mt-4 relative">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm underline hover:text-yellow-500"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"

                  {...register("password")}
                />
                 <button
                    type="button"
                    className="absolute right-2 top-9 text-sm text-gray-500"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <Eye className="w-5 h-5"/> : <EyeOff className="w-5 h-5"/>}
                  </button>
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password?.message?.toString()}</p>
                )}
              {msg && <div className="text-red-500 text-xs">{msg}</div>}
              </div>
              <Button
                type="submit"
                className="w-full mt-4"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </form>

            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => signIn("google", { callbackUrl: "/tests" })}
            >
              Login with Google
            </Button>

            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="underline hover:text-yellow-500">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignInForm;
