"use client";
import { Skeleton } from "@/components/ui/skeleton"; // Assuming you have Skeleton component from ShadCN
import { Card } from "../ui/card";

const ChallengeSkeleton = () => {
  return (
    <div className="min-h-screen bg text-white p-5">
      <div className="grid grid-cols-12 gap-1 md:gap-3">
        {/* Skeleton for User Profile */}
        <div className="col-span-12 md:col-span-3">
          <Skeleton className="p-2 md:p-4 space-y-6 rounded-lg">
            <Skeleton className="w-full h-20 rounded-lg" /> 
          </Skeleton>
        </div>
          
        {/* Skeleton for Recent Challenges */}
        <div className="col-span-12 md:col-span-9 space-y-4">
          <Skeleton className=" h-72 relative bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 py-16 px-6 sm:px-12 md:px-24 lg:px-36 rounded-lg shadow-lg overflow-hidden">
            {/* <div className="absolute inset-0 bg-white/5 backdrop-blur-lg rounded-lg"></div>
            <div className="relative z-10 ">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 noselect text-center">
              Join the Ultimate Challenge!
            </h1>
            <p className="text-lg sm:text-xl mb-8 text-gray-200 noselect text-center">
              Challenge friends, compete for the top spot, and improve your rank.
            </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Skeleton className="h-12 w-40 rounded-lg mx-auto" />
                <Skeleton className="h-12 w-40 rounded-lg mx-auto" />
              </div>
            </div> */}
          </Skeleton>
          <Skeleton className="w-full h-30 rounded-lg" />
          <Card className="p-4 rounded-lg">
            <h2 className="text-xl font-semibold">
            Recent Challenges
            </h2>

            <div className="space-y-2">
              {/* Simulate multiple challenges */}
              {[...Array(12)].map((_, index) => (
                <Skeleton key={index} className="flex justify-between p-3 px-3 my-2 border-2">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-9 h-9 rounded-md" /> {/* Simulating User Avatar */}
                    <Skeleton className="w-30 h-6" /> {/* Simulating Opponent Name */}
                  </div>
                  <Skeleton className="w-16 h-6" /> {/* Simulating User Score */}
                </Skeleton>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChallengeSkeleton;
