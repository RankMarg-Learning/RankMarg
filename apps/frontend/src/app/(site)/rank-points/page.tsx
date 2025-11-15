"use client"

import PointActivitySkeleton from "@/components/skeleton/skel_rank-points"
import { Badge } from "@repo/common-ui"
import { Card } from "@repo/common-ui"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import {  HandCoins } from "lucide-react"


function convertToIST(utcTimestamp: Date): string {
    return new Date(utcTimestamp.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })).toLocaleString();
}

export default function RankPoints() {
    
    const { data: activities, isLoading } = useQuery({
        queryKey: ["activity"],
        queryFn: async () => {
            const { data } = await axios.get(`/api/coins`);
            return data;
        },
    });
    if(isLoading) return <PointActivitySkeleton />
    const totalPoints = activities?.reduce((sum, activity) => sum + activity.earnCoin, 0)

    return (
            <div className="flex flex-col md:flex-row">

                {/* Main Content */}
                <div className="w-full  p-6 space-y-6">
                    <div className="flex justify-end items-center gap-2 text-sm text-gray-600">
                        <Badge variant="outline" className="text-yellow-600  py-1">
                            Your Points:
                            <div className="flex items-center">
                                <HandCoins className="w-4 h-4  mr-1" />
                                <span className="font-medium">{totalPoints}</span>
                            </div>
                        </Badge>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-6">Your Point Activity</h2>

                        <div className="space-y-4">
                            {activities?.map((activity) => (
                                <Card key={activity.id} className="p-4 bg-white shadow-sm border border-gray-100 shadow-yellow-200">
                                    <div className="flex items-start gap-4">
                                        <div className="rounded-full bg-yellow-50 p-3">
                                            <HandCoins className="w-5 h-5 text-yellow-500" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm text-gray-500">{activity.type}</div>
                                            <div className="font-medium text-gray-900">{activity.message}</div>
                                            <div className="text-sm text-gray-500 mt-1">{convertToIST(activity.createdAt.toLocaleString())}</div>
                                        </div>

                                        <div className="text-sm font-medium text-yellow-600">
                                            {activity.earnCoin > 0 ? "+" : ""}
                                            {activity.earnCoin}

                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
    )
}

