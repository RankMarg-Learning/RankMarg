'use client'

import { useEffect, useState } from "react"
import { Button } from "@repo/common-ui"
import { Input } from "@repo/common-ui"
import { Label } from "@repo/common-ui"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/common-ui"
import { Alert, AlertDescription, AlertTitle } from "@repo/common-ui"
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from "next/link"
import { resetPassword } from "@/services"
import { z } from "zod"

const passwordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Must include a lowercase letter")
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/[0-9]/, "Must include a number")
    .regex(/[^A-Za-z0-9]/, "Must include a special character"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export default function ResetPassword() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [token, setToken] = useState<string | null>(null)



  useEffect(() => {
    const url = new URL(window.location.href)
    setToken(url.searchParams.get("token"))
  }, [])




  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    const result = passwordSchema.safeParse({ password, confirmPassword });

    if (!result.success) {
      const issue = result.error.issues[0];
      setError(issue.message);
      return;
    }
    setIsLoading(true)
    setError(null)

    try {
      const response = await resetPassword(token as string, password)
      if (!response.success) {
        setError(response.message || "Something went wrong.")
        return
      }
      setPassword("")
      setSuccess(true)
    } catch (err) {
      setError(err.message || "Something went wrong.")
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <div className="flex justify-center items-center min-h-screen yellow-gradient">
      <Card className="w-[350px] shadow-lg">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <Alert className="mb-4">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Password reset successfully. You can now log in.
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleReset}>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              {error && (
                <div className="flex items-center mt-4 text-sm text-yellow-600">
                <AlertCircle className="mr-2 h-4 w-4" />
                {error}
              </div>
              )}
              <Button className="w-full mt-4" type="submit" disabled={isLoading}>
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center text-sm font-medium hover:underline">
          <Link href={'/sign-in'}>
            Back to Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}



