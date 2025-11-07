"use client"
import React from 'react'
import Image from 'next/image'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { useRouter } from 'next/navigation'
import { TextFormator } from '@/utils/textFormator'

interface UserBasicData {
    id: string
    name: string | null
    username: string | null
    avatar: string | null
    email: string | null
    phone: string | null
    location: string | null
    standard: string | null
    targetYear: string | null
    coins: number
    studyHoursPerDay: number | null
}

interface ProfileHeaderProps {
    userBasicData: UserBasicData
}

export function ProfileHeader({ userBasicData }: ProfileHeaderProps) {
    const router = useRouter()

    return (
        <div className="overflow-hidden">
            <div className="p-5">
                <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 mb-4">
                        <Image
                            src={userBasicData?.avatar || "/Profile_image.png"}
                            width={100}
                            height={100}
                            alt="Profile picture"
                            className="w-full h-full object-cover rounded-full border-4 border-white"
                        />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">
                        {userBasicData?.name}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                        @{userBasicData?.username}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        <Badge variant="outline">
                            {TextFormator(userBasicData?.standard)}
                        </Badge>
                        <Badge variant="secondary">
                            Target: {userBasicData?.targetYear}
                        </Badge>
                    </div>
                </div>

                <div className="mt-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-md border bg-amber-50 p-3 text-center">
                            <p className="text-xs text-muted-foreground">Coins</p>
                            <p className="text-xl font-semibold text-amber-600 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1z" />
                                </svg>
                                {userBasicData?.coins}
                            </p>
                        </div>
                        <div className="rounded-md border bg-gray-50 p-3 text-center">
                            <p className="text-xs text-muted-foreground">Study Hours</p>
                            <p className="text-xl font-semibold text-primary-600">
                                {userBasicData?.studyHoursPerDay}/day
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-5 pt-0">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Contact Information</h4>
                <ul className="space-y-3">
                    {userBasicData?.email && (
                        <li className="flex items-center text-muted-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {userBasicData?.email}
                        </li>
                    )}
                    {userBasicData?.phone && (
                        <li className="flex items-center text-muted-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {userBasicData?.phone}
                        </li>
                    )}
                    {userBasicData?.location && (
                        <li className="flex items-center text-muted-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {userBasicData?.location}
                        </li>
                    )}
                </ul>

                <div className="mt-6">
                    <Button 
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md transition-colors"
                        onClick={() => router.push('/profile')}
                    >
                        Edit Profile
                    </Button>
                </div>
            </div>
        </div>
    )
}
