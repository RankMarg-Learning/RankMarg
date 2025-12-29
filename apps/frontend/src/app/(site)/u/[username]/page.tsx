import React from "react";
import ProfilePage from "@/components/ProfilePage";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
    return {
        title: ` ${params.username} | RankMarg`,
        description: `Attempt the test with ID ${params.username} on RankMarg. Prepare for JEE and NEET with our mock tests.`,
    };
}

const UserProfile = ({ params }: { params: { username: string } }) => {
    const { username } = params;
    return (
        <ProfilePage username={username} />

    );
};

export default UserProfile;


// <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white dark:from-yellow-900 dark:to-gray-900">
//   <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
//     {/* Profile Header */}
//     <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 mb-8">
//       <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
//         <Avatar className="h-32 w-32 border-4 border-yellow-500 shadow-lg">
//           <Image src={ '/Profile_image.png'} alt={  "Avatar"} width={130} height={130} />
//           <AvatarFallback>{profile?.basicProfile.username.slice(0, 2).toUpperCase()}</AvatarFallback>
//         </Avatar>
//         <div className="text-center md:text-left">
//           <h1 className="text-3xl md:text-4xl font-bold">profile?.basicProfile?.name</h1>
//           <p className="text-xl text-muted-foreground">@profile?.basicProfile?.username</p>
//           <p className="text-sm text-muted-foreground mt-1 hidden">Joined 2 days ago</p>
//           <div className="flex flex-wrap items-center justify-center md:justify-start mt-3 gap-2">
//             {/* {profile?.basicProfile.isSelf && <Link href={'/rank-points'} > */}
//               <Badge variant="secondary" className="text-yellow-600 bg-yellow-100 px-3 py-1 cursor-pointer">
//                 <span className="text-xs">Your Coins :</span>
//                 <HandCoins className="w-4 h-4 mr-1" />
//                 profile.basicProfile.coins
//               </Badge>
//             {/* </Link> */}
//             {/* } */}
//             {/* <Badge variant="secondary" className="text-yellow-600 bg-yellow-100 px-3 py-1">
//               <Star className="w-4 h-4 mr-1" />
//               Rating {profile.challengeStats.rank}
//             </Badge>
//             <Badge variant="secondary" className="text-yellow-600 bg-yellow-100 px-3 py-1">
//               {RankDisplay({ elo: profile.challengeStats.rank }) || 'Rookie'}

//             </Badge> */}


//           </div>
//         </div>
//       </div>
//       {/* {profile?.basicProfile.isSelf && ( */}
//         <Link href={'/profile'}>
//           <Button variant="outline" className="gap-2 ">
//             <Edit2 className="h-4 w-4" />
//             Edit Profile
//           </Button>
//         </Link>
//       {/* )} */}
//     </div>

//     {/* Main Content */}
//     <div className="grid gap-6 md:grid-cols-3">
//       {/* Left Column */}
//       <div className="space-y-6">
//         {/* Stats */}
//         <Card className="border-yellow-500/20">
//           <CardHeader>
//             <CardTitle>Stats Overview</CardTitle>
//           </CardHeader>
//           <CardContent className="grid gap-4">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center">
//                 <CircleCheckBig className="h-5 w-5 text-yellow-500 mr-2" />
//                 <span>Solved Problems</span>
//               </div>
//               <span className="font-bold">profile.additionalInfo.totalAttempt </span>
//             </div>
//             <div className="flex items-center justify-between">
//               <div className="flex items-center">
//                 <BookOpenCheck className="h-5 w-5 text-yellow-500 mr-2" />
//                 <span>Mock Test</span>
//               </div>
//               <span className="font-bold">profile.additionalInfo.totalTest</span>
//             </div>

//             <div className="flex items-center justify-between">
//               <div className="flex items-center">
//                 <Target className="h-5 w-5 text-yellow-500 mr-2" />
//                 <span>Accuracy</span>
//               </div>
//               <span className="font-bold">(profile.additionalInfo.accuracy * 100).toFixed(2)%</span>
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="border-yellow-500/20  ">
//           <CardHeader>
//             <CardTitle>AI Insights</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-muted-foreground">
//               Based on your recent activity, we have some insights htmlFor you.
//             </p>
//             <ul className="space-y-2 mt-4">
//               <li>
//                 <span className="font-semibold">You are doing great!</span> Keep up the good work.
//               </li>
//               <li>
//                 <span className="font-semibold">You can improve</span> in Problem Solving.
//               </li>
//               <li>
//                 <span className="font-semibold">You are a quick learner</span> and have a good understanding of Data Analysis.
//               </li>
//             </ul>
//           </CardContent>
//         </Card>

//         {/* Skills */}
//         <Card className="border-yellow-500/20 hidden">
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Zap className="h-5 w-5 text-yellow-500" />
//               Skills
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-2">
//               {profileData?.skills.map((skill) => (
//                 <div key={skill.name} className="flex items-center justify-between">
//                   <span>{skill.name}</span>
//                   <div className="flex">
//                     {Array(5).fill(0).map((_, i) => (
//                       <Star
//                         key={i}
//                         className={`w-4 h-4 ${i < skill.level ? 'text-yellow-500' : 'text-gray-300'}`}
//                         fill={i < skill.level ? 'currentColor' : 'none'}
//                       />
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Middle Column */}
//       <div className="space-y-6 md:col-span-2">
//         {/* <SubjectStats subjectStats={profile.subjects} /> */}
//         <Tabs defaultValue="activity" className="w-full">
//           <TabsList className="grid w-full grid-cols-2 mb-4">
//             {/* <TabsTrigger value="progress">Progress</TabsTrigger> */}
//             <TabsTrigger value="achievements">Achievements</TabsTrigger>
//             <TabsTrigger value="activity">Attempts</TabsTrigger>
//             {/* <TabsTrigger value="rank">Challenge Rank</TabsTrigger> */}
//           </TabsList>
//           <TabsContent value="progress">

//           </TabsContent>
//           <TabsContent value="achievements">
//             <Card className="border-yellow-500/20">
//               <CardHeader>
//                 <CardTitle>Achievements</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//                   {profileData.achievements.map((achievement) => (
//                     <div key={achievement.name} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
//                       <achievement.icon className="h-8 w-8 text-yellow-500 flex-shrink-0" />
//                       <div>
//                         <h3 className="font-semibold">{achievement.name}</h3>
//                         <p className="text-sm text-muted-foreground">{achievement.description}</p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>
//           <TabsContent value="activity">
//             <Calender attempts={profile?.solvedAtValues} />
//           </TabsContent>
//           <TabsContent value="rank">
//             {/* <ChallengeStats stats={profile.challengeStats} /> */}
//           </TabsContent>
//         </Tabs>
//         <Card className="border-yellow-500/20 ">
//           <CardHeader>
//             <CardTitle>Recent Mock Test</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ul className="space-y-4">
//               {
//                 profile?.recentTest && profile?.recentTest.length > 0 ? (profile?.recentTest.map((test) => (
//                   <ul key={test.testId} className="flex items-center justify-between p-4 bg-muted rounded-lg ">
//                     <div className="space-y-1 flex-grow mr-4">
//                       <p className="font-medium">{test.test.title}</p>
//                       <div className="flex items-center gap-2">
//                         <span className="text-sm text-muted-foreground">Score</span>
//                         <span className="font-semibold">{test.score}/{test.test.totalMarks}</span>
//                       </div>
//                     </div>
//                     {
//                       profile?.basicProfile?.isSelf && (
//                         <div className="flex items-center gap-2">
//                           <Link href={`/t/${test.testId}/analysis`} target="_blank">
//                             <Button variant="outline" className="hover:border-yellow-400 hover:text-yellow-400" >View Analysis</Button>
//                           </Link>
//                         </div>
//                       )

//                     }

//                   </ul>
//                 ))) : <p>No test found</p>
//               }

//             </ul>
//           </CardContent>
//         </Card>
/* <Card className="border-yellow-500/20">
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
</Card> */
// </div>
// </div>


// </div>
// </div>