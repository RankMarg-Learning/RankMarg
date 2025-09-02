"use client"
import { useProfileData } from '@/hooks/useProfileData'
import React from 'react'
import ProfileSkeleton from './skeleton/profile.skeleton'
import { 
    ProfileHeader, 
    StudyStreak, 
    AcademicPerformance, 
    CurrentStudies, 
    RecentActivities 
} from './profile'



function ProfilePage({ username }: { username: string }) {
    const { userBasic, activities, currentStudies, isError, isLoading } = useProfileData({
        id: "0aad2b65-5334-4ab2-b6c8-1e37d97dc3f5",
        username
    })

    if (isLoading) {
        return <ProfileSkeleton />
    }
    
    if (isError) {
        return <div>Error loading profile data</div>
    }

    const userBasicData = userBasic?.data
    const userActivities = activities?.data
    const userCurrentStudies = currentStudies?.data

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Profile Header & Study Streak */}
                <div className="lg:col-span-1">
                    <ProfileHeader userBasicData={userBasicData} />
                    <StudyStreak userPerformance={userBasicData?.userPerformance} />
                </div>

                {/* Right Column - Academic Performance & Current Studies */}
                <div className="lg:col-span-2">
                    <AcademicPerformance userPerformance={userBasicData?.userPerformance} />
                    
                    <div className="overflow-hidden">
                        <CurrentStudies userCurrentStudies={userCurrentStudies || []} />
                        <div className="px-5">
                            <RecentActivities userActivities={userActivities} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfilePage