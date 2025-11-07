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
import {  useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const SetUsername = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null); 
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (username) {
                checkUsernameAvailability(username);
            } else {
                setIsAvailable(null); // Reset when input is empty
            }
        }, 300); // 300ms debounce

        return () => {
            clearTimeout(handler);
        };
    }, [username]);

    const checkUsernameAvailability = async (username: string) => {
        setLoading(true);
        try {
          const isCheck = true;
            const response = await axios.put(`/api/users`,
              {username,isCheck}
            );
           setIsAvailable(response.data.available);
            
        } catch (error) {
            console.error("Error checking username:", error);
            setIsAvailable(null); // Handle error case
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
    };

    const handleSetUsername = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const isCheck = false;
            const response = await axios.put(`/api/users`, { username,isCheck });


            if(
              response 
            ){
              router.push("/");
            }
            
        } catch (error) {
            console.error("Error setting username:", error);
        }
      }


  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-full max-w-md">
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Set Username</CardTitle>
            <CardDescription>
              Enter your unique username below to set to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
              <form  onSubmit={
                handleSetUsername
              }>
                <div className="grid gap-2 ">
                  <Label htmlFor="email"> Username</Label>
                  <Input
                    id="email"
                    type="text"
                    placeholder=" Set Username"
                    className={`border p-2 ${loading ? 'opacity-50' : ''}`}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full mt-3"
                
                >
                  Set Username
                </Button>
              </form>
              {loading && <p>Checking...</p>}
            {isAvailable === true && <p className="text-green-500">Username is available!</p>}
            {isAvailable === false && <p className="text-red-500">Username is taken. Please choose another.</p>}
            
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SetUsername