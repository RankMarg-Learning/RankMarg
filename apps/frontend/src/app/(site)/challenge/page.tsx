"use client";
import { Card } from "@/components/ui/card";
import React, {  useEffect, useState } from "react";
import { TrendingUp, Link2, CopyIcon } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import InviteFriend from "@/components/challenge/inviteFriend";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useSocket } from "@/hooks/useSocket";
import { useRouter } from "next/navigation";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";






const ChallengePage = () => {
  return (
    <div className="min-h-screen bg text-white p-5">
      <div className="grid grid-cols-12 gap-1 md:gap-3">
        <div className="col-span-12 md:col-span-3">
          <Card className="p-2  md:p-4   space-y-6 rounded-lg">
            <UserProfile />
          </Card>
        </div>
        <div className="col-span-12 md:col-span-9 space-y-4">
          <Banner/>
          <Card className=" p-4 rounded-lg">
            <h2 className="text-xl font-semibold">Recent Challenges</h2>
            <div className="mt-2 text-gray-400">No recent challenges found.</div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const UserProfile = () => {
  return (
    <div className="   flex justify-between p-2 md:flex-col rounded-lg ">
      <div className="flex flex-row md:justify-between  ">
        <div className="flex flex-col justify-center items-center">
          <h2 className="text-base sm:text-lg font-semibold">Aniket Sudke</h2>
          <p className="text-gray-400 text-sm sm:text-base ">@aniketsudke</p>
        </div>
        <Link className="hidden" href={`/`}>
          <Link2 className="text-yellow-500 hover:text-yellow-400 md:mt-0.5 mt-1 size-4 md:size-7" />
        </Link>
      </div>
      <Separator className=" md:my-5 hidden " />
      <div className="mt-2  text-center ">
        <h3 className="text-lg sm:text-xl flex justify-center sm:justify-start">Rating</h3>
        <p className="text-2xl sm:text-4xl flex items-center justify-center sm:justify-start">
          1080{" "}
          <span className="items-center flex ml-2">
            <TrendingUp color="green" />
          </span>
        </p>
      </div>
    </div>
  );
};

const Banner = () => {
  const router = useRouter();
  const  socket = useSocket();
  const [open, setOpen] = useState(false);
  const [invite, setInvite] = useState(false);
  const [challengeLink,setChallengeLink] = useState<string>(`http://localhost:3000/challenge/test`);

  console.log("Invite",invite);
  console.log("Open",open); 
  
  
  useEffect(() => {
    if (!socket) return;
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case "INIT_CHALLENGE":
          if(message.payload.invite){setInvite(true);}
          break;
        case "CHALLENGE_ADD":
          setChallengeLink(`http://localhost:3000/challenge/${message.challengeId}`);
          if(invite){setOpen(true);}
          break;
        case "CHALLENGE_START":
          router.push(`/challenge/${message.payload.challengeId}`);
          break;

      }
    };
  }, [socket]);

  const handleCopy = () => {
    navigator.clipboard.writeText(challengeLink);
  }
  return (
    
    <div className="relative bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 py-16 px-6 sm:px-12 md:px-24 lg:px-36 rounded-lg shadow-lg text-white text-center overflow-hidden">
      <div className="absolute inset-0 bg-white/5 backdrop-blur-lg rounded-lg"></div>
      <div className="relative z-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 noselect">
          Join the Ultimate Challenge!
        </h1>
        <p className="text-lg sm:text-xl mb-8 text-gray-200 noselect">
          Challenge friends, compete for the top spot, and improve your rank.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Button className="relative bg-yellow-700 hover:bg-yellow-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition duration-300 transform hover:scale-105 overflow-hidden group" 
          onClick={
            () => {
              socket?.send(JSON.stringify({ type: "INIT_CHALLENGE",
              payload: {
                invite: false,
              }
               }));
            }
          }
          
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 transform -translate-x-full group-hover:translate-x-full"></span>
            <span className="relative z-10" >Join Challenge </span>
          </Button>
      {/* <DialogTrigger asChild> */}
        <Button className="relative bg-yellow-600 hover:bg-yellow-500 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition duration-300 transform hover:scale-105 overflow-hidden group"
        onClick={
          () => {
            socket?.send(JSON.stringify({ type: "INIT_CHALLENGE",
            payload: {
              invite: true,
            }
             }));
             setInvite(true);
            }
        }
        >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 transform -translate-x-full group-hover:translate-x-full"></span>
                <span className="relative z-10">Invite a Friend</span>
        </Button>
      {/* </DialogTrigger> */}
      <Dialog open={open} onOpenChange={setOpen}>
      
      <DialogContent className="sm:max-w-md bg-white" >
        <DialogHeader>
          <DialogTitle>Share link</DialogTitle>
          <DialogDescription>
            Anyone who has this link will be able to view this.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input
              id="link"
              defaultValue={challengeLink}
              
              readOnly
            />
          </div>
          <Button type="submit" size="sm" className="px-3"
          onClick={handleCopy}
          >
            <span className="sr-only">Copy</span>
            <CopyIcon className="h-4 w-4" />
          </Button>
        </div>
        <DialogFooter className="sm:justify-between gap-2">
          <DialogClose asChild>
            <Button type="button" >
              Close
            </Button>
          </DialogClose>
          <Button type="submit" 
           >
                Start Challenge
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
         {/* <InviteFriend /> */}
        </div>
      </div>
    </div>
  );
};

export default ChallengePage;
