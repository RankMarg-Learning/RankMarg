"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/common-ui";
import React from "react";
import {  Link2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Separator } from "@repo/common-ui";
import { Button } from "@repo/common-ui";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ChallengeSkeleton from "@/components/challenge/ChallengeSkelaton";
import { Badge } from "@repo/common-ui";
import Banner from "@/components/challenge/banner";
import ScheduleBanner from "@/components/challenge/scheduleBanner";


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

  const isScheduleBanner = true;

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
          {
            isScheduleBanner ?(<ScheduleBanner/>):<Banner/>
          }
          
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
                    <Link  href={`/review/${challenge.challengeId}`}>
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

  

export default ChallengePage;

