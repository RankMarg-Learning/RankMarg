"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";

import AdditionInfo from "@/components/profile/AdditionInfo";
import BasicProfile from "@/components/profile/BasicProfile";
import Calender from "@/components/profile/Calender";
import ContributionBanner from "@/components/profile/Contribute";
// import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import SubjectStats from "@/components/profile/SubjectStats";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import { User } from "@prisma/client";
import { ChallengeStats } from "@/components/profile/ChallengeStats";
import { UserProfileResponse } from "@/types";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trophy, Medal, Target, Edit2, CheckCircle2, XCircle, Zap, Book, Users, Calendar, Star, Atom, CircleCheckBig, Swords } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import Image from "next/image";





const UserProfile = ({ params }: { params: { username: string } }) => {
  const { username } = params;
  

  const profileData = {
    name: "Anonymous",
    username: "@sudke",
    avatar: "/placeholder.svg",
    joinedDate: "4 days ago",
    rank: 47,
    coins: 1250,
    stats: {
      solvedProblems: 4.5,
      challenges: 14,
      accuracy: 0.57,
    },
    subjects: [
      { name: "Physics", completed: 1, color: "bg-blue-500" },
      { name: "Chemistry", completed: 3, color: "bg-green-500" },
      { name: "Mathematics", completed: 0, color: "bg-gray-200" },
    ],
    skills: [
      { name: "Problem Solving", level: 4 },
      { name: "Critical Thinking", level: 3 },
      { name: "Data Analysis", level: 5 },
      { name: "Logical Reasoning", level: 4 },
      { name: "Scientific Method", level: 3 },
    ],
    ratingHistory: Array.from({ length: 10 }, (_, i) => ({
      day: i + 1,
      rating: Math.floor(Math.random() * 20) + 35,
    })),
    recentAttempts: [
      { id: 1, questionName: "Newton's Laws of Motion", isCorrect: true, solvedAt: "2024-11-09T14:30:00Z" },
      { id: 2, questionName: "Periodic Table Elements", isCorrect: false, solvedAt: "2024-11-08T10:15:00Z" },
      { id: 3, questionName: "Quadratic Equations", isCorrect: true, solvedAt: "2024-11-07T16:45:00Z" },
      { id: 4, questionName: "Thermodynamics Principles", isCorrect: true, solvedAt: "2024-11-06T09:00:00Z" },
      { id: 5, questionName: "Organic Chemistry Nomenclature", isCorrect: false, solvedAt: "2024-11-05T11:20:00Z" },
    ],
    achievements: [
      { name: "Quick Learner", description: "Completed 10 challenges in a day", icon: Zap },
      { name: "Consistent Performer", description: "Maintained 80% accuracy for a week", icon: Target },
      { name: "Team Player", description: "Participated in 5 group challenges", icon: Users },
    ]
  }

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
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white dark:from-yellow-900 dark:to-gray-900">
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className="h-32 w-32 border-4 border-yellow-500 shadow-lg">
            <Image src={profile.basicProfile.avatar} alt={profile.basicProfile.name} width={130} height={130}/>
            <AvatarFallback>{profile.basicProfile.username.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold">{profile.basicProfile.name}</h1>
            <p className="text-xl text-muted-foreground">{profile.basicProfile.username}</p>
            <p className="text-sm text-muted-foreground mt-1">Joined 2 days ago</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start mt-3 gap-2">
              <Badge variant="secondary" className="text-yellow-600 bg-yellow-100 px-3 py-1">
                <Star className="w-4 h-4 mr-1" />
                Rating {profile.challengeStats.rank}
              </Badge>
              {profile.basicProfile.isSelf && (
              <Badge variant="secondary" className="text-yellow-600 bg-yellow-100 px-3 py-1">
                <Atom className="w-4 h-4 mr-1" />
                {profile.basicProfile.coins} Atoms
              </Badge>)}
            </div>
          </div>
        </div>
        {profile.basicProfile.isSelf && (
        <Button variant="outline" className="gap-2">
          <Edit2 className="h-4 w-4" />
          Edit Profile
        </Button>)}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Stats */}
          <Card className="border-yellow-500/20">
            <CardHeader>
              <CardTitle>Stats Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CircleCheckBig className="h-5 w-5 text-yellow-500 mr-2" />
                  <span>Solved Problems</span>
                </div>
                <span className="font-bold">{profile.additionalInfo.totalAttempt} </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Swords className="h-5 w-5 text-yellow-500 mr-2" />
                  <span>Challenges</span>
                </div>
                <span className="font-bold">{profile.additionalInfo.totalChallenge}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Target className="h-5 w-5 text-yellow-500 mr-2" />
                  <span>Accuracy</span>
                </div>
                <span className="font-bold">{(profile.additionalInfo.accuracy * 100).toFixed(2)}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="border-yellow-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {profileData.skills.map((skill) => (
                  <div key={skill.name} className="flex items-center justify-between">
                    <span>{skill.name}</span>
                    <div className="flex">
                      {Array(5).fill(0).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < skill.level ? 'text-yellow-500' : 'text-gray-300'}`}
                          fill={i < skill.level ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column */}
        <div className="space-y-6 md:col-span-2">
            <SubjectStats subjectStats={profile.subjects} />
            <Tabs defaultValue="rank" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                {/* <TabsTrigger value="progress">Progress</TabsTrigger> */}
                {/* <TabsTrigger value="achievements">Achievements</TabsTrigger> */}
                <TabsTrigger value="rank">Challenge Rank</TabsTrigger>
                <TabsTrigger value="activity">Attempts</TabsTrigger>
              </TabsList>
              <TabsContent value="progress">
                
              </TabsContent>
              <TabsContent value="achievements">
                <Card className="border-yellow-500/20">
                  <CardHeader>
                    <CardTitle>Achievements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {profileData.achievements.map((achievement) => (
                        <div key={achievement.name} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                          <achievement.icon className="h-8 w-8 text-yellow-500 flex-shrink-0" />
                          <div>
                            <h3 className="font-semibold">{achievement.name}</h3>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="rank">
                <ChallengeStats stats={profile.challengeStats} />
              </TabsContent>
              <TabsContent value="activity">
                <Calender attempts={profile.solvedAtValues}/>
              </TabsContent>
            </Tabs>
            <Card className="border-yellow-500/20">
                <CardHeader>
                  <CardTitle>Recent Attempts</CardTitle>
                </CardHeader>
                <CardContent>
                 
                    <ul className="space-y-4">
                    {profile.attempts && profile.attempts.length > 0 ? (
                        profile.attempts.map((attempt) => (
                          <li key={attempt.questionId} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                            <div className="space-y-1 flex-grow mr-4">
                              <p className="font-medium">{attempt.question.subject}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(attempt.solvedAt).toLocaleDateString()}
                              </p>
                            </div>
                            {attempt.isCorrect ? (
                              <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
                            ) : (
                              <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                            )}
                          </li>
                        ))
                      ) : (
                        <p>No attempts found</p>
                      )}
                    </ul>
                </CardContent>
              </Card>
        </div>
      </div>

      {/* Contribution Section */}
      <Card className="mt-8 relative overflow-hidden border-yellow-500/20">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-yellow-500 opacity-10" />
        <CardContent className="relative py-8 sm:py-12">
          <div className="text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold">Contribute to the community</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Share your knowledge and help others</p>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">Contribute Now</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
  );
};

export default UserProfile;
