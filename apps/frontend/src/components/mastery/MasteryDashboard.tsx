"use client"
import React from 'react'
import MasteryOverview from './MasteryOverview'
import SubjectMasteryCard from './SubjectMasteryCard'
import { useMasteryDashboard } from '@/hooks/useMasteryDashboard'
import MasteryDashboardSkeleton from '../skeleton/mastery.dashboard.skeleton'
import { CheckIcon, Lightbulb, Star, Target } from 'lucide-react'



const MasteryDashboard = () => {

  const {masteryBasic,subjectMastery,isLoading,isError} = useMasteryDashboard()

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
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Target className="h-5 w-5 text-green-600" />
                <h5 className="text-sm sm:text-base font-semibold text-gray-800">Your Weekly Learning Cycle</h5>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                {/* Monday to Friday */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="h-4 w-4 text-white" />
                  </div>
                  <div className="pt-1">
                    <p className="text-sm font-medium text-gray-700">Daily Practice Sessions</p>
                    <p className="text-xs text-gray-600 mt-1">Solve questions - even 10-15 minutes daily helps!</p>
                  </div>
                </div>

                {/* Weekend Analysis */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Star className="h-4 w-4 text-white" />
                  </div>
                  <div className="pt-1">
                    <p className="text-sm font-medium text-gray-700">AI Mastery Analysis</p>
                    <p className="text-xs text-gray-600 mt-1">Get detailed insights, weak areas, and personalized recommendations</p>
                  </div>
                </div>

                {/* Next Week */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="pt-1">
                    <p className="text-sm font-medium text-gray-700">Targeted Improvement</p>
                    <p className="text-xs text-gray-600 mt-1">Focus on recommended topics for faster progress</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tip */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Lightbulb className='text-amber-600 w-5 h-5'/>
                <h5 className="text-sm sm:text-base font-semibold text-gray-800">Pro Tip</h5>
              </div>
                <div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Consistency beats intensity! Practice a little each day rather than cramming everything into one session.
                  </p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MasteryDashboard