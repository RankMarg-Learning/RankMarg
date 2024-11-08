"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";

import AdditionInfo from "@/components/profile/AdditionInfo";
import BasicProfile from "@/components/profile/BasicProfile";
import Calender from "@/components/profile/Calender";
import ContributionBanner from "@/components/profile/Contribute";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import SubjectStats from "@/components/profile/SubjectStats";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import { User } from "@prisma/client";
import { ChallengeStats } from "@/components/profile/ChallengeStats";
import { UserProfileResponse } from "@/types";





const UserProfile = ({ params }: { params: { username: string } }) => {
  const { username } = params;
  

  const { data: profile, isLoading, isError } = useQuery<UserProfileResponse>({
    queryKey: ["user", username],
    queryFn: async () => {
      const { data } = await axios.get(`/api/profile/${username}`);
      return data;
    },
  });

  if (isLoading) return <ProfileSkeleton />;
  if (isError) return <p className="text-center text-red-500">Failed to load user data</p>;

  return (
    <div className="md:min-w-[940px] max-w- mx-auto my-5">
      <Card className="md:flex justify-center items-center m-1">
        <BasicProfile basicProfile={profile.basicProfile} />
        <Separator orientation="vertical" className="h-auto" />
        <AdditionInfo additionInfo={profile.additionalInfo} />
      </Card>

      <Card className="flex mx-1 my-3">
        <SubjectStats subject="Physics" color="blue" totalQuestions={profile.subjects.Physics.TotalQuestion} solvedQuestions={profile.subjects.Physics.AttemptCount} />
        <SubjectStats subject="Chemistry" color="green" totalQuestions={profile.subjects.Chemistry.TotalQuestion} solvedQuestions={profile.subjects.Chemistry.AttemptCount} />
        <SubjectStats subject="Mathematics" color="orange" totalQuestions={profile.subjects.Mathematics.TotalQuestion} solvedQuestions={profile.subjects.Mathematics.AttemptCount} />
      </Card>

      <div className="w-full">
        <ChallengeStats stats={profile.challengeStats} />
        <Calender attempts={profile.solvedAtValues}/>
        <ContributionBanner />
      </div>
    </div>
  );
};

export default UserProfile;
