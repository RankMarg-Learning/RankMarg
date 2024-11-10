"use client";
import { Card } from "@/components/ui/card";
import React, {  useEffect, useState } from "react";
import {  Link2, CopyIcon, MoveUp, MoveDown } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/hooks/useSocket";
import { useRouter } from "next/navigation";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ChallengeSkeleton from "@/components/challenge/ChallengeSkelaton";


interface ChallengeInfoProps {
  userStats:{
    name: string;
    username: string;
    rank: number;
 },
  recentChallenges:{
    challengeId: string;
    result: string | null; 
    createdAt: Date; 
    opponentUsername: string; 
    userScore: number;
  }[]
}




const ChallengePage = () => {
  

  const { data: challengeInfo, isLoading } = useQuery<ChallengeInfoProps>({
    queryKey: ["challenge-info"],
    queryFn: async () => {
      const { data } = await axios.get<ChallengeInfoProps>(`/api/challenge/info`);
      return data;
    },
  });

  if (isLoading) {
    return <ChallengeSkeleton />;
  }


  return (
    <div className="min-h-screen bg text-white p-5">
      <div className="grid grid-cols-12 gap-1 md:gap-3">
        <div className="col-span-12 md:col-span-3">
          <Card className="p-2  md:p-4   space-y-6 rounded-lg">
            <UserProfile user={challengeInfo.userStats}/>
          </Card>
        </div>
        <div className="col-span-12 md:col-span-9 space-y-4">
          <Banner/>
          <Card className=" p-4 rounded-lg">
            <h2 className="text-xl font-semibold">Recent Challenges</h2>
            {
              challengeInfo ? (challengeInfo.recentChallenges.slice(0, 12).map((challenge) => (
                <Link href={`/challenge/${challenge.challengeId}`} className="flex border-2 rounded-md  justify-between p-3 px-3 my-2 hover:bg-gray-50" key={challenge.challengeId}>
                  <div className="flex items-center">
                    <span className="bg-yellow-100 text-yellow-500 font-semibold px-2 py-1 rounded mr-3">
                      VS
                    </span>
                    <h2 className="  text-gray-800">
                      {challenge.opponentUsername}
                    </h2>
                  </div>
                  <p className="mr-5 font-semibold text-gray-600 flex">{challenge.userScore} 
                          {challenge.userScore > 0 ? (
                    <span className="text-green-500 ml-1"><MoveUp/></span>
                  ) : challenge.userScore < 0 ? (
                    <span className="text-red-500 ml-1"><MoveDown/></span>
                  ) : <span className=" ml-1">&nbsp; - &nbsp;</span>}
                          </p>
                        </Link>
                      ))
                    ):(
                      <div className="mt-2 text-gray-400">No recent challenges found.</div>
                    )
            }
          </Card>
            
            
        </div>
      </div>
    </div>
  );
};

const UserProfile = ({user}:{user:{name:string,username:string,rank:number}}) => {
  return (
    <div className="flex justify-between p-2  rounded-lg ">
      <div className="flex flex-row md:justify-between  ">
        <div className="flex flex-col md:justify-start justify-center items-start">
          <h2 className="text-base sm:text-lg font-semibold">{user.name || "User Name"}</h2>
          <p className="text-gray-400 text-sm sm:text-base ">@{user.username}</p>
        </div>
        <Link className="hidden" href={`/`}>
          <Link2 className="text-yellow-500 hover:text-yellow-400 md:mt-0.5 mt-1 size-4 md:size-7" />
        </Link>
      </div>
      <Separator className=" md:my-5 hidden " />
      <div className=" text-center ">
        <h3 className="text-base  flex justify-center sm:justify-start">Rating</h3>
        <p className="text-4xl sm:text-4xl font-semibold flex items-center justify-center sm:justify-start">
          {user.rank}{" "}
         
        </p>
      </div>
    </div>
  );
};

  const Banner = () => {
  const router = useRouter();
  const  socket = useSocket();
  const [open, setOpen] = useState(false);
  const [challengeLink,setChallengeLink] = useState<string>(`http://localhost:3000/challenge/test`);



  
  useEffect(() => {
    if (!socket) return;
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case "INIT_CHALLENGE":
          if(message.payload.invite){setOpen(true);}
          break;
        case "CHALLENGE_ADD":
          setChallengeLink(`http://localhost:3000/challenge/${message.challengeId}`);
          // if(invite){setOpen(true);}
          
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
            //  setInvite(true);
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

export { ChallengePage as default, Banner };

