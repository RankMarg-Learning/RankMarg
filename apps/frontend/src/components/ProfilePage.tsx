"use client"
import { useProfileData } from '@/hooks/useProfileData'
import { TextFormator } from '@/utils/textFormator'
import React from 'react'
import Image from 'next/image'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation'
import { Progress } from './ui/progress'
import { SubjectBackgroundColor, SubjectIcons, SubjectTextColor } from '@/constant/SubjectColorCode'
import { format } from 'date-fns'
import Link from 'next/link'
import ProfileSkeleton from './skeleton/profile.skeleton'

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



function ProfilePage({ username }: { username: string }) {
    const router = useRouter()
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
        <div className="max-w-7xl mx-auto" id="el-8wjkn6cy">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="el-pccwqpqf">
                <div className="lg:col-span-1" id="el-9hhqclxs">
                    <div className="bg-white rounded-lg  overflow-hidden border border-neutral-200/30" id="el-4t8ksl3h">
                        <div className="p-5" id="el-6okbp9bd">
                            <div className="flex flex-col items-center" id="el-glupe86c">
                                <div className="relative w-32 h-32 mb-4" id="el-6gqzb2fs">
                                    <Image src={userBasicData?.avatar || "/Profile_image.png"} width={100} height={100} alt="Profile picture" className="w-full h-full object-cover rounded-full border-4 border-white" id="el-vmmcp80t" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800" id="el-6tdve9az">{userBasicData?.name}</h3>
                                <p className="text-gray-500 mb-4" id="el-3tvpkwz4">@{userBasicData?.username}</p>
                                <div className="flex items-center mb-4" id="el-u1jxjbqe">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 mr-2" id="el-rf42p8ky">
                                        {TextFormator(userBasicData?.standard)}
                                    </span>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800" id="el-eprjh0fy">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" id="el-zaezgsmp">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" id="el-7it9saee"></path>
                                        </svg>
                                        Target: {userBasicData?.targetYear}
                                    </span>
                                </div>
                                <div className=" items-center justify-center space-x-2 mb-4 hidden" id="el-v4yir2vp">
                                    <div className="flex items-center text-amber-500" id="el-bqci3q66">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" id="el-5pgvo44g">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" id="el-khj6nm0c"></path>
                                        </svg>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" id="el-t9nfmt6e">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" id="el-sitq1rme"></path>
                                        </svg>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" id="el-f21sth9t">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" id="el-qtnxd3qz"></path>
                                        </svg>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" id="el-r7fagw5h">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" id="el-6kq0or8j"></path>
                                        </svg>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" id="el-is9isq4r">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" id="el-tgoqqdki"></path>
                                        </svg>
                                    </div>
                                    <span className="text-sm text-gray-600" id="el-3vyifz7u">5.0 (Perfect Score!)</span>
                                </div>
                            </div>

                            <div className="mt-6" id="el-j2jisrly">
                                <div className="grid grid-cols-2 gap-4" id="el-0zu6b1sr">
                                    <div className="bg-gray-50 rounded-lg p-3 text-center" id="el-8x1b7ui7">
                                        <p className="text-sm text-gray-500" id="el-tbct83it">Coins</p>
                                        <p className="text-xl font-semibold text-amber-500 flex items-center justify-center" id="el-ad6tmqzt">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor" id="el-5ho2vxxn">
                                                <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1z" id="el-mpcrpnzc"></path>
                                            </svg>
                                            {userBasicData?.coins}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3 text-center" id="el-uqzn6w24">
                                        <p className="text-sm text-gray-500" id="el-yvrea8rc">Study Hours</p>
                                        <p className="text-xl font-semibold text-primary-600" id="el-bav77v1v">{userBasicData?.studyHoursPerDay}/day</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-neutral-200/20 p-5" id="el-36a801ga">
                            <h4 className="text-md font-medium text-gray-700 mb-3" id="el-jcloel2a">Contact Information</h4>
                            <ul className="space-y-3" id="el-04tus88k">
                                {
                                    userBasicData?.email && (
                                        <li className="flex items-center text-gray-600" id="el-omx5gtrk">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" id="el-1j84urbd">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" id="el-272oinw5"></path>
                                            </svg>
                                            {userBasicData?.email}
                                        </li>
                                    )
                                }
                                {
                                    userBasicData?.phone && (
                                        <li className="flex items-center text-gray-600" id="el-5250gutq">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" id="el-kmu8dndd">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" id="el-827kpqt4"></path>
                                            </svg>
                                            {userBasicData?.phone}
                                        </li>
                                    )
                                }
                                {
                                    userBasicData?.location && (
                                        <li className="flex items-center text-gray-600" id="el-pxj3dskg">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" id="el-gqvg12c3">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" id="el-go77h3lk"></path>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" id="el-iy3aqksf"></path>
                                            </svg>
                                            {userBasicData?.location}
                                        </li>
                                    )
                                }

                            </ul>

                            <div className="mt-6" id="el-89fq4p0w">
                                <Button className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md transition-colors" id="el-oed1c9ut"
                                    onClick={() => {
                                        router.push('/profile')
                                    }}
                                >
                                    Edit Profile
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg  overflow-hidden border border-neutral-200/30 mt-6" id="el-fhglnghk">
                        <div className="bg-gradient-to-br from-primary-500 to-primary-600 px-5 py-4" id="el-uanx9s4v">
                            <h4 className="text-lg font-semibold text-white" id="el-10roalo3">Study Streak</h4>
                        </div>
                        <div className="p-5" id="el-tzxiyxpq">
                            <div className="flex items-center justify-between mb-4" id="el-thk9x48a">
                                <div id="el-yi9vgfbb">
                                    <span className="text-3xl font-bold text-primary-600" id="el-44x6idbi">
                                        {userBasicData?.userPerformance?.streak || 0}
                                    </span>
                                    <span className="text-gray-500 ml-2" id="el-w159gazu">days</span>
                                </div>
                                <div className="bg-primary-100 text-primary-800 text-xs font-medium px-3 py-1 rounded-full" id="el-yuqswifc">
                                    Current
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-2 mb-4" id="el-st3jbpm3">
                                {[...Array(7)].map((_, index) => {
                                    const streak = userBasicData?.userPerformance?.streak || 0;
                                    const isCompleted = streak >= 7 - index;
                                    return (
                                        <div
                                            key={index}
                                            className={`h-10 rounded-md ${isCompleted ? 'bg-primary-600' : 'bg-gray-300'}`}
                                        />
                                    );
                                })}
                            </div>

                            <div className="text-center text-sm text-gray-500" id="el-yrg0crlv">
                                <p id="el-zkd7qi3u">
                                    Last {userBasicData?.userPerformance?.streak || 0} days completed successfully!
                                </p>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="lg:col-span-2" id="el-lsgi29pf">
                    <div className="bg-white rounded-lg  overflow-hidden border border-neutral-200/30 mb-6" id="el-ddb7gyt8">
                        <div className="px-5 py-4 border-b border-neutral-200/20" id="el-yz7bgln3">
                            <h3 className="text-lg font-semibold text-gray-800" id="el-q4jbfkw4">Academic Performance</h3>
                        </div>
                        <div className="p-5" id="el-34a4sk37">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6" id="el-no36xezx">
                                <div className="bg-gray-50 rounded-lg p-4" id="el-6207zdd4">
                                    <div className="flex items-center justify-between mb-2" id="el-0dj5hc6j">
                                        <p className="text-sm text-gray-500" id="el-qa7mtiwu">Accuracy</p>
                                        <span className="text-sm font-medium text-primary-600" id="el-39k8zc0j">{userBasicData?.userPerformance?.accuracy?.toFixed(2) || 0.0}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5" id="el-rvdhqui8">
                                        <Progress indicatorColor='bg-primary-600' value={userBasicData?.userPerformance?.accuracy || 0} className="h-2.5 rounded-full" id="el-0j8v1q4g" />
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 hidden" id="el-0qoauo7f">
                                    <div className="flex items-center justify-between mb-2" id="el-ymzq28en">
                                        <p className="text-sm text-gray-500" id="el-p1zgiad6">Completion Rate</p>
                                        <span className="text-sm font-medium text-green-600" id="el-m9glosya">92%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5" id="el-5hp2scu3">
                                        <div className="bg-green-600 h-2.5 rounded-full" style={{ width: "92%" }} id="el-bg2ubuat"></div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4" id="el-cptx9c1e">
                                    <div className="flex items-center justify-between mb-2" id="el-aq3gtngf">
                                        <p className="text-sm text-gray-500" id="el-o4bztcuj">Average Score</p>
                                        <span className="text-sm font-medium text-primary-600" id="el-k0w88hbo">{userBasicData?.userPerformance?.avgScore || 0}/100</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5" id="el-gwxq68ty">
                                        <Progress indicatorColor='bg-primary-600' value={userBasicData?.userPerformance?.avgScore || 0} className="h-2.5 rounded-full" id="el-0j8v1q4g" />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6" id="el-rm7e0jk2">
                                <h4 className="text-md font-medium text-gray-700 mb-3" id="el-3oha6m6y">Subject-wise Performance</h4>
                                <div className="space-y-4">
                                    {userBasicData?.userPerformance?.subjectWiseAccuracy &&
                                        Object.entries(userBasicData.userPerformance.subjectWiseAccuracy).length > 0 ? (
                                        Object.entries(userBasicData.userPerformance.subjectWiseAccuracy).map(([subjectKey, stats]) => {
                                            const subject = subjectKey.toLowerCase();
                                            const Icon = SubjectIcons[subject] || SubjectIcons.default;
                                            const accuracy = parseFloat(((stats as { accuracy: number }).accuracy ?? 0).toFixed(2));
                                            const textColor = SubjectTextColor[subject] || SubjectTextColor.default;
                                            const barColor = SubjectBackgroundColor[subject] || SubjectBackgroundColor.default;

                                            return (
                                                <div key={subjectKey}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div className="flex items-center gap-2">
                                                            <Icon className={`w-4 h-4 ${textColor}`} />
                                                            <span className={`text-sm font-medium ${textColor}`}>
                                                                {subjectKey.charAt(0).toUpperCase() + subjectKey.slice(1)}
                                                            </span>
                                                        </div>
                                                        <span className={`text-sm font-medium ${textColor}`}>
                                                            {accuracy}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                        <div
                                                            className={`${barColor} h-2.5 rounded-full transition-all duration-500`}
                                                            style={{ width: `${accuracy}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-gray-500 text-center py-4" id="el-9w8v5b1f">
                                            No subject-wise performance data available.
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                    <div className="bg-white rounded-lg  overflow-hidden border border-neutral-200/30 " id="el-jl7ezxoh">
                        <div className="px-5 py-4 border-b border-neutral-200/20" id="el-vlvwknq5">
                            <h3 className="text-lg font-semibold text-gray-800" id="el-yz06mzkf">Current Study Progress</h3>
                        </div>
                        <div className="p-5 space-y-5" id="el-dxuya1n6">
                            <div className="space-y-6">
                                {userCurrentStudies
                                    .filter((item) => item.isCurrent && !item.isCompleted)
                                    .map((study) => {
                                        const subjectKey = study.subjectName.toLowerCase();
                                        const Icon = SubjectIcons[subjectKey] || SubjectIcons.default;
                                        const iconBg = SubjectBackgroundColor[subjectKey] || SubjectBackgroundColor.default;
                                        const textColor = SubjectTextColor[subjectKey] || SubjectTextColor.default;

                                        const formattedStartDate = format(new Date(study.startedAt), "MMM d, yyyy");

                                        return (
                                            <div key={study.id} className="mb-6">
                                                <div className="flex items-center mb-3">
                                                    <div className={`h-10 w-10 rounded-full ${iconBg} bg-opacity-20 flex items-center justify-center mr-3`}>
                                                        <Icon className={`h-6 w-6 ${textColor}`} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-md  text-gray-800">Currently Studying</h4>
                                                        <p className="text-sm text-gray-500">
                                                            {study.subjectName}: {study.topicName}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="ml-13 pl-5 border-l-2 border-dashed border-blue-200">

                                                    <p className="text-sm text-gray-500 mb-1">
                                                        Started: {formattedStartDate}
                                                    </p>

                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800" id="el-qxvwlpa0">Recent Activity</h4>
                            <div className="space-y-4">
                                {userActivities?.activities && userActivities?.activities.length > 0 ? userActivities?.activities?.map((activity) => {
                                    const { icon, bg, text } = getIconAndColor(activity.type);
                                    return (
                                        <div className="flex" key={activity.id}>
                                            <div className="flex-shrink-0">
                                                <div className={`flex items-center justify-center h-10 w-10 rounded-md ${bg} ${text}`}>
                                                    {icon}
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <h5 className="text-sm font-medium text-gray-800">
                                                    {activity.type === "Profile" ? "Profile Updated" : "Mission Completed"}
                                                </h5>
                                                <p className="text-xs text-gray-500">{formatDate(activity.createdAt)}</p>
                                                <p className="text-sm text-gray-600 mt-1">{activity.message} (+{activity.earnCoin} coins)</p>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="text-gray-500 text-center py-4" id="el-9w8v5b1f">
                                        No recent activities found.
                                    </div>
                                )}
                            </div>
                            {
                                userActivities?.activities && userActivities?.activities.length > 4 && (
                                    <div className="mt-6 text-center" id="el-nxhlxk6x">
                                        <Link href="/rank-points" className="text-primary-600 hover:text-primary-800 text-sm font-medium" id="el-myfgz1mw" target="_self">
                                            View Complete Activity Log
                                        </Link>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>


        </div>
    )
}

export default ProfilePage