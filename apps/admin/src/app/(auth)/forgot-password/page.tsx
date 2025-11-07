"use client";
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle, ArrowRight } from 'lucide-react'
import { getForgotPassword } from '@/services';

const ForgotPassoword = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading,setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
          setIsLoading(true);
            const response = await getForgotPassword(email);
            setMessage(response.success ? "Check your email for the reset link" : response.message);
        } catch (error) {
            setMessage(error.response.data.error);
        }
        finally{
          setIsLoading(false);
        }
       
      };

  return (
    <div className="flex items-center justify-center min-h-screen yellow-gradient">
    <Card className="w-[350px] shadow-lg">
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>Enter your email to reset your password</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          {message && (
            <div className="flex items-center mt-4 text-sm text-yellow-600">
              <AlertCircle className="mr-2 h-4 w-4" />
              {message}
            </div>
          )}
        </CardFooter>
      </form>
    </Card>
  </div>
  )
}

export default ForgotPassoword