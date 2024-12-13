"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, {  useEffect, useState } from "react";
import {  Link2, CopyIcon, ChevronRight } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";


interface ChallengeInfoProps {
  userStats:{
    name: string;
    username: string;
    rank: number;
 },
  recentChallenges:{
    challengeId: string;
    opponentUsername: string;
    result : string | null;
    status: string;
    userScore: number[] | null;
    opponentScore: number[] | null;
    createdAt: Date;
  }[]
}


const challengeScore = (score: number[] | null) => {
  if (!score) return "-";
  return score.reduce((acc, curr) => acc + curr, 0);
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
    <>
    
    <div className="min-h-screen bg text-white p-5">
      <div className="grid grid-cols-12 gap-1 md:gap-3">
        <div className="col-span-12 md:col-span-3">
          <Card className="p-2  md:p-4   space-y-6 rounded-lg">
            <UserProfile user={challengeInfo.userStats}/>
          </Card>
        </div>
        <div className="col-span-12 md:col-span-9 space-y-4">
          <Banner/>
          <Card className="mb-6">
          <CardHeader>
            <CardTitle>Recent Challenges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {challengeInfo.recentChallenges.length>0?challengeInfo.recentChallenges.map((challenge) => (
                <div
                  key={challenge.challengeId}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="mb-2 sm:mb-0">
                    <div className="font-semibold">CHAL-{challenge.challengeId.slice(0,5)}</div>
                    <div className="text-sm text-muted-foreground">
                      vs {challenge.opponentUsername}
                    </div>
                  </div>
                  
                  <div className="flex flex-row justify-between  items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                    <Badge variant={
                      challenge.status === 'PENDING' ? 'secondary' :
                      challenge.status === 'IN_PROGRESS' ? 'default' : 'outline'
                    }>
                      {challenge.status}
                    </Badge>
                    <div className="text-left sm:text-right">
                      <div className={`font-semibold`}>{challengeScore(challenge.userScore)} - {challengeScore(challenge.opponentScore)}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(challenge.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Link href={`/challenge/${challenge.challengeId}`}>
                      <Button variant="ghost" size="sm" className="ml-auto font-semibold">
                        View 
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )):<div className="text-center">No recent challenges</div>}
            </div>
          </CardContent>
        </Card>
            
            
        </div>
      </div>
    </div>
    </>
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
  const [join, setJoin] = useState(false);
  const [challengeLink,setChallengeLink] = useState<string>(`${process.env.NEXT_PUBLIC_WEBSITE_URL!}/challenge/test`);



  
  useEffect(() => {
    if (!socket) return;
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case "INIT_CHALLENGE":
          if(message.payload.invite){setOpen(true);}
          setOpen(true);
          break;
        case "CHALLENGE_ADD":
          setChallengeLink(`${process.env.NEXT_PUBLIC_WEBSITE_URL!}/challenge/${message.challengeId}`);
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

          <Button  className="relative bg-yellow-700 hover:bg-yellow-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition duration-300 transform hover:scale-105 overflow-hidden group" 
          onClick={
            () => {
              socket?.send(JSON.stringify({ type: "INIT_CHALLENGE",
              payload: {
                invite: false,
              }
               }));
               setJoin(true);
            }
          }
          
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 transform -translate-x-full group-hover:translate-x-full"></span>
            <span className="relative z-10" >Join Challenge </span>
          </Button>
      {/* <DialogTrigger asChild> */}
        <Button  className="relative bg-yellow-600 hover:bg-yellow-500 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition duration-300 transform hover:scale-105 overflow-hidden group"
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
        {
          join?<>
          <DialogHeader>
          <DialogTitle className="text-center">Waiting for an opponent...</DialogTitle>
          <DialogDescription>
            Want to speed up? Invite a friend to join the challenge.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" onClick={
              ()=>setJoin(false)
            } >
              Close
            </Button>
          </DialogClose>
         
        </DialogFooter>
        </>:
        <>
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
        <DialogFooter className="sm:justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" >
              Close
            </Button>
          </DialogClose>
         
        </DialogFooter>
        </>
        }
        
      </DialogContent>
    </Dialog>
         {/* <InviteFriend /> */}
        </div>
      </div>
    </div>
  );
};

export default ChallengePage;

