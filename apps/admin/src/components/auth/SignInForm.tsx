"use client";

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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import api from "@/utils/api";
import Link from "next/link";
import { signin_completed } from "@/utils/analytics";

const signInSchema = z.object({
  username: z
    .string()
    .min(1, "Email or username is required"),
  password: z
    .string().min(6, "Password is required"),
});

const SignInForm = () => {
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("error"); 
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signInSchema),
  });

  const router = useRouter();

  const handleLogin = async (data: { username: string; password: string }) => {
    setIsLoading(true);
    setMsg("");
    
    try {
      const response = await api.post("/auth/sign-in", data);
      
      if (response.data.success && response.data.data) {
        const user = response.data.data.user;
        if (user.role !== 'ADMIN') {
          try {
            await api.post('/auth/sign-out');
          } catch (error) {
            console.error("Failed to clear session for non-admin user:", error);
          }

          setMsg("Access restricted to administrators. Please sign in with an admin account.");
          setMsgType("error");
          return;
        }

        signin_completed('email');
        setMsg("Welcome back! Redirecting...");
        setMsgType("success");
        
        setTimeout(() => {
          router.push('/admin');
        }, 500);
      } else {
        setMsg(response.data.message || "Login failed. Please try again.");
        setMsgType("error");
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      
      if (error.response?.data?.message) {
        setMsg(error.response.data.message);
      } else if (error.response?.data?.error === "UNAUTHORIZED") {
        setMsg("Invalid username or password. Please check your credentials and try again.");
      } else if (error.response?.status >= 500) {
        setMsg("Server error. Please try again later.");
      } else {
        setMsg("An unexpected error occurred. Please check your connection and try again.");
      }
      setMsgType("error");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const lowercaseUsername = event.target.value.toLowerCase();
    setValue("username", lowercaseUsername, { shouldValidate: true });
  };

  const getMessageStyles = () => {
    switch (msgType) {
      case "success":
        return "bg-green-50 text-green-600 border-green-200";
      case "warning":
        return "bg-yellow-50 text-yellow-600 border-yellow-200";
      case "error":
      default:
        return "bg-red-50 text-red-600 border-red-200";
    }
  };
  
  return (
    <div className="flex items-center justify-center h-screen yellow-gradient">
      <div className="w-full max-w-md">
        <Card className="mx-auto max-w-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Admin Sign In</CardTitle>
            <CardDescription>
              Enter your administrator credentials to access the RankMarg control panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleLogin)}>
              <div className="grid gap-2">
                <Label htmlFor="email">Email or Username</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="Your email or username"
                  {...register("username")}
                  onChange={handleUsernameChange}
                  className={errors.username ? "border-red-300 focus:ring-red-500" : ""}
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
                    className="text-sm text-primary-600 hover:text-primary-800 underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  className={errors.password ? "border-red-300 focus:ring-red-500" : ""}
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
              </div>
              
              {msg && (
                <Alert className={`mt-2  ${getMessageStyles()}`}>
                  <AlertDescription>{msg}</AlertDescription>
                </Alert>
              )}
              
              <Button
                type="submit"
                className="w-full mt-4"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
            
            <p className="text-center text-xs text-gray-500 mt-4">
              Protected by enterprise-grade security. We respect your privacy.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignInForm;
