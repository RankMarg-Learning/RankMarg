"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@repo/common-ui";
import { Input } from "@repo/common-ui";
import { Label } from "@repo/common-ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/common-ui";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@repo/common-ui";
import api from "@/utils/api";
import { click_login_cta, signup_completed } from "@/utils/analytics";

const signUpSchema = z.object({
  fullname: z.string().min(1, "Full name is required"),
  username: z
    .string()
    .min(1, "Username is required")
    .regex(/^[a-zA-Z0-9_]+$/, "Username must contain only letters, numbers, or underscores"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(6, "Password must be at least 6 characters long.")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter.")
    .regex(/\d/, "Password must contain at least one number."),
  confirmpassword: z.string()
    .min(6, "Password must be at least 6 characters long.")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter.")
    .regex(/\d/, "Password must contain at least one number."),
});

const SignUpForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("error"); 
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(signUpSchema),
  });

  const watchPassword = watch("password");
  const watchConfirmPassword = watch("confirmpassword");
  const watchUsername = watch("username");

  const handleSignUp = async (data: z.infer<typeof signUpSchema>) => {
    setMsg("");
    setIsLoading(true);
    
    if (data.password !== data.confirmpassword) {
      setMsg("Passwords do not match");
      setMsgType("error");
      setIsLoading(false);
      return;
    }

    // Check if username is available before proceeding
    if (!isUsernameAvailable) {
      setMsg("Please choose an available username");
      setMsgType("error");
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post("/auth/sign-up", data);
      if (response.data.success) {
        setMsg("Account created successfully. Redirecting to sign-in page...");
        setMsgType("success");
        signup_completed('email');
        setTimeout(() => {
          router.push("/sign-in");
        }, 1500);
      } else {
        // Handle API error response
        setMsg(response.data.message || "Account creation failed. Please try again.");
        setMsgType("error");
      }
    } catch (error: any) {
      console.error("Sign-up failed:", error);
      
      // Handle different types of errors
      if (error.response?.data?.message) {
        // API returned an error message
        setMsg(error.response.data.message);
      } else if (error.response?.data?.error === "UNAUTHORIZED") {
        // Specific unauthorized error
        setMsg("Account creation failed. Please check your information and try again.");
      } else if (error.response?.status === 400) {
        // Bad request - validation errors
        setMsg("Please check your information and try again.");
      } else if (error.response?.status === 409) {
        // Conflict - user already exists
        setMsg("An account with this email or username already exists.");
      } else if (error.response?.status >= 500) {
        // Server error
        setMsg("Server error. Please try again later.");
      } else {
        // Network or other errors
        setMsg("An unexpected error occurred. Please check your connection and try again.");
      }
      setMsgType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.trim() === "") {
      setIsUsernameAvailable(true);
      return;
    }

    setIsCheckingUsername(true);
    try {
      const res = await api.get(`/auth/check-username`, {
        params: { username: username.trim() },
      });
      console.log(res.data.data);
  
      // Fixed: Access the success property correctly from API response
      setIsUsernameAvailable(res.data.data.available);
    } catch (error: any) {
      console.error("Username check failed:", error);
      // On API error, assume username is not available to be safe
      setIsUsernameAvailable(false);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  useEffect(() => {
    const username = watchUsername;
  
    if (!username || username.trim() === "") {
      setIsUsernameAvailable(true);
      setIsCheckingUsername(false);
      return;
    }
  
    const delayDebounce = setTimeout(() => {
      checkUsernameAvailability(username);
    }, 500); 
    
    return () => clearTimeout(delayDebounce);
  }, [watchUsername]);

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const lowercaseUsername = event.target.value.toLowerCase();
    setValue("username", lowercaseUsername, { shouldValidate: true });
  };

  // Helper function to get message styling based on type
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

  // Helper function to determine if form can be submitted
  const canSubmit = () => {
    return isUsernameAvailable && 
           !isCheckingUsername && 
           !isLoading && 
           watchUsername && 
           watchUsername.trim() !== "";
  };

  const handleSignUpWithGoogle = () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
      
      window.location.href = `${backendUrl}/api/auth/google`;
      signup_completed('google');
    } catch (error) {
      console.error("Google sign up failed:", error);
      setMsg("Failed to initiate Google sign up. Please try again.");
      setMsgType("error");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen yellow-gradient">
      <div className="w-full max-w-md">
        <Card className="mx-auto max-w-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Join Our Community</CardTitle>
            <CardDescription>
              Create your account and start your journey with us today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <form onSubmit={handleSubmit(handleSignUp)}>
                <div className="grid gap-2 mb-2">
                  <Label htmlFor="fullname">Full Name</Label>
                  <Input
                    id="fullname"
                    type="text"
                    placeholder="Enter your full name"
                    {...register("fullname")}
                    className={errors.fullname ? "border-red-300 focus:ring-red-500" : ""}
                  />
                  {errors.fullname?.message && (
                    <div className="text-red-500 text-xs">
                      {errors.fullname.message.toString()}
                    </div>
                  )}
                </div>
                <div className="grid gap-2 mb-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <Input
                      id="username"
                      type="text"
                      placeholder="Choose a unique username"
                      {...register("username")}
                      onChange={handleUsernameChange}
                      className={errors.username || !isUsernameAvailable ? "border-red-300 focus:ring-red-500" : ""}
                    />
                    {isCheckingUsername && watchUsername && (
                      <div className="absolute right-2 top-2">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      </div>
                    )}
                  </div>
                  {errors.username && (
                    <div className="text-red-500 text-xs">
                      {errors.username.message.toString()}
                    </div>
                  )}
                  {!isUsernameAvailable && watchUsername && watchUsername.trim() !== "" && !isCheckingUsername && (
                    <div className="text-red-500 text-xs">
                      This username is already taken. Please choose another one.
                    </div>
                  )}
                  {isUsernameAvailable && watchUsername && watchUsername.trim() !== "" && !isCheckingUsername && !errors.username && (
                    <div className="text-green-500 text-xs">
                      Username is available!
                    </div>
                  )}
                </div>
                <div className="grid gap-2 mb-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Your email address"
                    {...register("email")}
                    className={errors.email ? "border-red-300 focus:ring-red-500" : ""}
                  />
                  {errors.email && (
                    <div className="text-red-500 text-xs">
                      {errors.email.message.toString()}
                    </div>
                  )}
                </div>
                <div className="grid gap-2 mb-2 relative items-center">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a secure password"
                    {...register("password")}
                    className={errors.password ? "border-red-300 focus:ring-red-500" : ""}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-7 text-sm text-gray-500"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <Eye className="w-5 h-5"/> : <EyeOff className="w-5 h-5"/>}
                  </button>
                  {errors.password && (
                    <div className="text-red-500 text-xs">
                      {errors.password.message.toString()}
                    </div>
                  )}
                </div>
                <div className="grid gap-2 mb-2 relative">
                  <Label htmlFor="confirmpassword">Confirm Password</Label>
                  <Input
                    id="confirmpassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    {...register("confirmpassword")}
                    className={errors.confirmpassword || (watchPassword && watchConfirmPassword && watchPassword !== watchConfirmPassword) 
                      ? "border-red-300 focus:ring-red-500" 
                      : ""}
                  />
                 
                  {errors.confirmpassword && (
                    <div className="text-red-500 text-xs">
                      {errors.confirmpassword.message.toString()}
                    </div>
                  )}
                  {watchPassword &&
                    watchConfirmPassword &&
                    watchPassword !== watchConfirmPassword && (
                      <div className="text-red-500 text-xs">
                        Passwords do not match
                      </div>
                    )}
                </div>
                
                {msg && (
                  <Alert className={`mb-2 ${getMessageStyles()}`}>
                    <AlertDescription>{msg}</AlertDescription>
                  </Alert>
                )}
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!canSubmit()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating your account...
                    </>
                  ) : (
                    "Create an account"
                  )}
                </Button>
              </form>
              
              <div className="relative">
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
                onClick={()=>handleSignUpWithGoogle()}
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
                Sign up with Google
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                onClick={()=>click_login_cta('Sign in','signup_page_cta')}
                className="underline text-primary-600 hover:text-primary-800"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUpForm;
