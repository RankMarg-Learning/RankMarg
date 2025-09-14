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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import api from "@/utils/api";

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

  const handleGoogleLogin = () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
      
      window.location.href = `${backendUrl}/api/auth/google`;
    } catch (error) {
      console.error("Google login failed:", error);
      setMsg("Failed to initiate Google login. Please try again.");
      setMsgType("error");
    }
  };

  const handleLogin = async (data: { username: string; password: string }) => {
    setIsLoading(true);
    setMsg("");
    
    try {
      const response = await api.post("/auth/sign-in", data);
      
      if (response.data.success && response.data.data) {
        setMsg("Welcome back! Redirecting...");
        setMsgType("success");
        
        const user = response.data.data.user;
        let redirectPath = '/dashboard';
        
        if (user.isNewUser) {
          redirectPath = '/onboarding';
        } else {
          switch (user.role) {
            case 'ADMIN':
              redirectPath = '/admin';
              break;
            case 'INSTRUCTOR':
              redirectPath = '/instructor';
              break;
            default:
              redirectPath = '/dashboard';
          }
        }
        
        setTimeout(() => {
          router.push(redirectPath);
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
            <CardTitle className="text-2xl">Welcome Back!</CardTitle>
            <CardDescription>
              Sign in to access your personalized dashboard and continue your journey
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
                    Forgot your password?
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

            <div className="relative mt-6 mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M12.0001 4.67676C13.0358 4.67676 14.0783 5.01379 14.9571 5.65121L18.1868 2.45786C16.1994 0.851428 14.0215 0 12.0001 0C8.19786 0 4.80133 1.8833 2.80084 4.70755L6.0246 7.92534C7.07276 5.95617 9.39311 4.67676 12.0001 4.67676Z"
                  fill="#EA4335"
                />
                <path
                  d="M23.49 12.2744C23.49 11.4608 23.4177 10.6473 23.2732 9.86816H12V14.4972H18.47C18.1894 16.0691 17.3213 17.4077 16.0739 18.308L19.1955 21.4396C21.3577 19.3149 23.49 16.2083 23.49 12.2744Z"
                  fill="#4285F4"
                />
                <path
                  d="M5.95 14.3044C5.68 13.6107 5.53 12.8695 5.53 12.1008C5.53 11.3321 5.68 10.5908 5.95 9.89721L2.72621 6.67943C1.85843 8.29984 1.35181 10.1476 1.35181 12.1008C1.35181 14.054 1.85843 15.9017 2.72621 17.5222L5.95 14.3044Z"
                  fill="#FBBC05"
                />
                <path
                  d="M12.0001 24.0001C14.0215 24.0001 15.855 23.359 17.3051 22.2692L14.1835 19.1376C13.3138 19.6606 12.24 20.0001 12.0001 20.0001C9.39311 20.0001 7.07276 18.7207 6.0246 16.7515L2.80084 19.9693C4.80133 22.7936 8.19786 24.0001 12.0001 24.0001Z"
                  fill="#34A853"
                />
              </svg>
              Login with Google
            </Button>

            <div className="mt-4 text-center text-sm">
              New to our platform?{" "}
              <Link href="/sign-up" className="text-yellow-600 hover:text-yellow-800 underline ">
                Create an account
              </Link>
            </div>
            
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
