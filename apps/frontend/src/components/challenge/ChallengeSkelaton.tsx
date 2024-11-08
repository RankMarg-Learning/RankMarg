"use client";
import { Skeleton } from "@/components/ui/skeleton"; // Assuming you have Skeleton component from ShadCN
import { Card } from "../ui/card";
import { Banner } from "@/app/(site)/challenge/page";

const ChallengeSkeleton = () => {
  return (
    <div className="min-h-screen bg text-white p-5">
      <div className="grid grid-cols-12 gap-1 md:gap-3">
        {/* Skeleton for User Profile */}
        <div className="col-span-12 md:col-span-3">
          <Card className="p-2 md:p-4 space-y-6 rounded-lg">
            <Skeleton className="w-full h-16 rounded-lg" /> {/* Simulating User Profile Image */}
            <Skeleton className="w-3/4 h-6 rounded-lg" /> {/* Simulating User Name */}
            <Skeleton className="w-1/2 h-4 rounded-lg" /> {/* Simulating User Info */}
          </Card>
        </div>

        {/* Skeleton for Recent Challenges */}
        <div className="col-span-12 md:col-span-9 space-y-4">
          <Banner />
          <Card className="p-4 rounded-lg">
            <h2 className="text-xl font-semibold">
              <Skeleton className="w-1/4 h-6" /> {/* Simulating Section Title */}
            </h2>

            <div className="space-y-2">
              {/* Simulate multiple challenges */}
              {[...Array(12)].map((_, index) => (
                <div key={index} className="flex justify-between p-3 px-3 my-2 border-2">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-10 h-10 rounded-full" /> {/* Simulating User Avatar */}
                    <Skeleton className="w-1/2 h-6" /> {/* Simulating Opponent Name */}
                  </div>
                  <Skeleton className="w-16 h-6" /> {/* Simulating User Score */}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChallengeSkeleton;
