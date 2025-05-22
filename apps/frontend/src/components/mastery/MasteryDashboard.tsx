"use client"
import React from 'react'
import MasteryOverview from './MasteryOverview'
import SubjectMasteryCard from './SubjectMasteryCard'
import { useMasteryDashboard } from '@/hooks/useMasteryDashboard'
import MasteryDashboardSkeleton from '../skeleton/mastery.dashboard.skeleton'



const MasteryDashboard = () => {

  const {masteryBasic,subjectMastery,isLoading,isError} = useMasteryDashboard({
    id:  "0aad2b65-5334-4ab2-b6c8-1e37d97dc3f5"
  })

  if(isLoading) return <MasteryDashboardSkeleton/>

  if(isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Error loading data</p>
      </div>
    )
  }


  return (
    <div>
      <div className="mb-8 md:space-y-6 space-y-3">
        <MasteryOverview overview={masteryBasic?.data}/>
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Subject Mastery</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {
              subjectMastery?.data?.map((subject) => (
                <SubjectMasteryCard key={subject.id} sbt={subject} />
              ))
            }
              
          </div>
        </div>
      </div>
    </div>
  )
}

export default MasteryDashboard