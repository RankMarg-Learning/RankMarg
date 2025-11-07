"use client"
import React from 'react'
import Link from 'next/link'

interface Activity {
    id: string
    type: string
    message: string
    earnCoin: number
    createdAt: string
}

interface ActivitiesData {
    activities: Activity[]
}

interface RecentActivitiesProps {
    userActivities: ActivitiesData | null
}

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });
};

const getIconAndColor = (type: string) => {
    switch (type) {
        case "Profile":
            return {
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
                bg: "bg-indigo-100",
                text: "text-indigo-600",
            };
        case "Mission":
            return {
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                    </svg>
                ),
                bg: "bg-green-100",
                text: "text-green-600",
            };
        default:
            return {
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M12 6v6l4 2" />
                    </svg>
                ),
                bg: "bg-gray-100",
                text: "text-gray-600",
            };
    }
};

export function RecentActivities({ userActivities }: RecentActivitiesProps) {
    const activities = userActivities?.activities || []

    return (
        <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-800 mb-4">Recent Activity</h4>
            <div className="divide-y divide-neutral-200/60">
                {activities.length > 0 ? (
                    activities.map((activity) => {
                        const { icon, bg, text } = getIconAndColor(activity.type);
                        return (
                            <div className="flex py-3 first:pt-0" key={activity.id}>
                                <div className="flex-shrink-0">
                                    <div className={`flex items-center justify-center h-9 w-9 rounded-md ${bg} ${text}`}>
                                        {icon}
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h5 className="text-sm font-medium text-gray-800">
                                        {activity.type === "Profile" ? "Profile Updated" : "Mission Completed"}
                                    </h5>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDate(activity.createdAt)}
                                    </p>
                                    <p className="text-xs text-gray-700 mt-1">
                                        {activity.message} (+{activity.earnCoin} coins)
                                    </p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-muted-foreground text-center py-4">
                        No recent activities found.
                    </div>
                )}
            </div>
            
            {activities.length > 4 && (
                <div className="mt-6 text-center">
                    <Link 
                        href="/rank-points" 
                        className="text-primary-600 hover:text-primary-800 text-xs font-medium"
                        target="_self"
                    >
                        View Complete Activity Log
                    </Link>
                </div>
            )}
        </div>
    )
}
