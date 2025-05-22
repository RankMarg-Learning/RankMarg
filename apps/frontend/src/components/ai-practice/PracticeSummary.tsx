import { Goal, Hourglass, ListChecks } from 'lucide-react'
import React from 'react'
import { Progress } from '../ui/progress'
import { SubjectBackgroundColor } from '@/constant/SubjectColorCode';
import { PracticeSummaryProps } from '@/types/aiPractice.type';


const PracticeSummary = ({ overview }: { overview: PracticeSummaryProps }) => {

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8" id="el-bbfwi7xn">
      <div className="bg-white rounded-xl border border-gray-200/30 shadow-sm p-6 mb-6" id="el-apff7nrt">
        <div className="flex items-center mb-6" id="el-0xj57rr7">

          <div id="el-phmx46ko">
            <h3 className="text-lg font-bold text-gray-800" id="el-eisyrxk8">Today's Practice Summary</h3>
            <p className="text-sm text-gray-500 hidden" id="el-tlrp2d5i">Last updated: 15 minutes ago</p>
          </div>
          <div className="ml-auto" id="el-vczkcuts">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800" id="el-mn44esex">
              Live Stats
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6" id="el-zthqsegj">
          <div className="space-y-4" id="el-dr9izoii">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg" id="el-pt6s1wka">
              <div className="flex items-center gap-1" id="el-nmpgsv87">
                <ListChecks className='w-5 h-5 text-primary-400' />
                <span className="text-gray-700" id="el-0ify9m9f">Total Questions Solved:</span>
              </div>
              <span className=" font-bold text-gray-800" id="el-rg3ii8i3">{overview?.overallSummary?.attempted}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg" id="el-r6i7wtcn">
              <div className="flex items-center gap-1" id="el-njiayf50">
                <Hourglass className='w-5 h-5 text-primary-400' />
                <span className="text-gray-700 " id="el-tsn2booa">Time Spent:</span>
              </div>
              <span className=" font-bold text-gray-800" id="el-xr2n4kfm">{overview?.overallSummary?.timeSpent} min</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg" id="el-tmiyczck">
              <div className="flex items-center gap-1" id="el-bmq1jpjk">
                <Goal className='w-5 h-5 text-primary-400' />
                <span className="text-gray-700 " id="el-b06x4zpa">Accuracy Rate:</span>
              </div>
              <span className=" font-bold text-gray-800" id="el-dtkpces9">{overview?.overallSummary?.accuracyRate}%</span>
            </div>
          </div>

          <div className="flex flex-col justify-between h-full" id="el-mytbouoa">
            <div>
              <h4 className="font-medium text-gray-800 mb-2" id="el-plvzw5le">Subject Breakdown</h4>
              <div className="space-y-3">
                {overview?.subjectWiseSummary.length > 0 ? (overview?.subjectWiseSummary?.map((sm, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{sm?.subject}</span>
                      <span className="font-medium">{sm?.totalQuestions} Questions</span>
                    </div>
                    <Progress value={(sm?.totalAttempts / sm?.totalQuestions) * 100} indicatorColor={` ${SubjectBackgroundColor[sm?.subject.toLowerCase() as keyof typeof SubjectBackgroundColor] || SubjectBackgroundColor.default}`} className="h-2.5" />
                  </div>
                ))) : (
                  <div className="flex flex-col items-center justify-center text-center py-10">
                    <h2 className="text-base font-semibold text-gray-800">
                      No subject-wise breakdown available
                    </h2>
                    <p className="mt-2 text-xs text-gray-600 max-w-xs">
                      Today’s practice session hasn’t been generated yet. Check back soon!
                    </p>

                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200/30 shadow-sm p-6" id="el-4w5xs49y">
        <div className="flex items-center justify-between mb-4" id="el-jjw9xv95">
          <h3 className="text-lg font-bold text-gray-800" id="el-8r424lv9">AI Smart Suggestions</h3>
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full" id="el-hrd5jcmf">Personalized</span>
        </div>

        <div className="space-y-4 text-sm" id="el-uvj32rui">
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200" id="el-7fjiscm4">
            <p className="text-gray-800" id="el-wvvjb65b"><strong id="el-znpcnhfb" className="">Thermodynamics Tip:</strong> You struggled with Thermodynamics today. Revise these 5 key formulas!</p>
            <button className="mt-2 text-sm text-amber-600 hover:text-amber-800 font-medium" id="el-q7cen1z3">View Formulas →</button>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200" id="el-47hxrqck">
            <p className="text-gray-800" id="el-i143nq8m"><strong id="el-3vd1m4us">Mechanics Improvement:</strong> You're improving in Mechanics! Want to challenge yourself with tougher questions?</p>
            <button className="mt-2 text-sm text-green-600 hover:text-green-800 font-medium" id="el-3defrjdp">Start Hard Level →</button>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200" id="el-kvwb6tjr">
            <p className="text-gray-800" id="el-h310ssj5"><strong id="el-o0l9up5h" className="">Study Tip:</strong> You're solving questions too fast—try reading carefully to avoid silly mistakes.</p>
            <button className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium" id="el-gpw9qkq8">View Detailed Analysis →</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PracticeSummary