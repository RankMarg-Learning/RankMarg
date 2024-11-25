'use client'

import { useState} from "react"
import {  useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from "next/link"
import axiox from "axios"

// export default function ResetPassword() {
//   const [password, setPassword] = useState("")
//   const [confirmPassword, setConfirmPassword] = useState("")
//   const [error, setError] = useState<string | null>(null)
//   const [success, setSuccess] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)

//   const searchParams = useSearchParams()
//   const token = searchParams.get("token")


//   const handleReset = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (password !== confirmPassword) {
//       setError("Passwords do not match.")
//       return
//     }

//     setIsLoading(true)
//     setError(null)

//     try {
//       const res = await fetch("/api/auth/reset-password", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ token, password }),
//       })

//       if (!res.ok) throw new Error("Failed to reset password.")
//       setSuccess(true)
//     } catch (err) {
//       setError(err.message || "Something went wrong.")
//     } finally {
//       setIsLoading(false)
//     }
//   }

 

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gray-100">
//       <Card className="w-[350px]">
//         <CardHeader>
//           <CardTitle>Reset Password</CardTitle>
//           <CardDescription>Enter your new password below</CardDescription>
//         </CardHeader>
//         <CardContent>
//           {success ? (
//             <Alert className="mb-4">
//               <CheckCircle2 className="h-4 w-4" />
//               <AlertTitle>Success</AlertTitle>
//               <AlertDescription>
//                 Password reset successfully. You can now log in.
//               </AlertDescription>
//             </Alert>
//           ) : (
//             <form onSubmit={handleReset}>
//               <div className="grid w-full items-center gap-4">
//                 <div className="flex flex-col space-y-1.5">
//                   <Label htmlFor="password">New Password</Label>
//                   <Input
//                     id="password"
//                     type="password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     required
//                   />
//                 </div>
//                 <div className="flex flex-col space-y-1.5">
//                   <Label htmlFor="confirmPassword">Confirm Password</Label>
//                   <Input
//                     id="confirmPassword"
//                     type="password"
//                     value={confirmPassword}
//                     onChange={(e) => setConfirmPassword(e.target.value)}
//                     required
//                   />
//                 </div>
//               </div>
//               {error && (
//                 <Alert variant="destructive" className="mt-4">
//                   <AlertCircle className="h-4 w-4" />
//                   <AlertTitle>Error</AlertTitle>
//                   <AlertDescription>{error}</AlertDescription>
//                 </Alert>
//               )}
//               <Button className="w-full mt-4" type="submit" disabled={isLoading}>
//                 {isLoading ? "Resetting..." : "Reset Password"}
//               </Button>
//             </form>
//           )}
//         </CardContent>
//         <CardFooter className="flex justify-center">
//           <Link href={'/sign-in'}>
//             Back to Login
//           </Link>
//         </CardFooter>
//       </Card>
//     </div>
//   )
// }



import React from 'react'

const ResetPassword = () => {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    try {
      const res = await axiox.post("/api/auth/reset-password", 
      { token, password },
      { headers: { "Content-Type": "application/json" } }
      )
      if(res){
        setSuccess(true)
      }

    } catch (error) {
      console.error(error)
      setError( "Something went wrong.")
      return;
    }
    finally {
      setIsLoading(false)
    }

    return;
  }
 

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
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
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button className="w-full mt-4" type="submit" disabled={isLoading}>
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href={'/sign-in'}>
            Back to Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

export default ResetPassword;