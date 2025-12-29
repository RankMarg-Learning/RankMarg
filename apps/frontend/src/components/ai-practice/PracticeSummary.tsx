import { Goal, Hourglass, ListChecks } from 'lucide-react'
import React from 'react'
import { Progress } from '@repo/common-ui'
import { SubjectBackgroundColor } from '@/constant/SubjectColorCode';
import { PracticeSummaryProps, StudySuggestionProps } from '@/types/aiPractice.type';
import { useToast } from '@/hooks/use-toast';

const suggestionTypeStyles: Record<string, { card: string; button: string; buttonHover: string; text: string }> = {
  MOTIVATION: {
    card: 'bg-green-50 border-green-200',
    button: 'bg-green-600 text-white',
    buttonHover: 'hover:bg-green-700',
    text: 'text-green-800'
  },
  CELEBRATION: {
    card: 'bg-yellow-50 border-yellow-200',
    button: 'bg-yellow-500 text-white',
    buttonHover: 'hover:bg-yellow-600',
    text: 'text-yellow-800'
  },
  REMINDER: {
    card: 'bg-blue-50 border-blue-200',
    button: 'bg-blue-600 text-white',
    buttonHover: 'hover:bg-blue-800',
    text: 'text-blue-800'
  },
  WARNING: {
    card: 'bg-red-50 border-red-200',
    button: 'bg-red-600 text-white',
    buttonHover: 'hover:bg-red-800',
    text: 'text-red-800'
  },
  GUIDANCE: {
    card: 'bg-purple-50 border-purple-200',
    button: 'bg-purple-600 text-white',
    buttonHover: 'hover:bg-purple-800',
    text: 'text-purple-800'
  },
};

const PracticeSummary = ({ overview ,suggestions}: { overview: PracticeSummaryProps, suggestions:StudySuggestionProps[]}) => {
  const { toast } = useToast();

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
              <span className=" font-bold text-gray-800" id="el-rg3ii8i3">{overview?.overallSummary?.attempted || 0}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg" id="el-r6i7wtcn">
              <div className="flex items-center gap-1" id="el-njiayf50">
                <Hourglass className='w-5 h-5 text-primary-400' />
                <span className="text-gray-700 " id="el-tsn2booa">Time Spent:</span>
              </div>
              <span className=" font-bold text-gray-800" id="el-xr2n4kfm">{overview?.overallSummary?.timeSpent || 0} min</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg" id="el-tmiyczck">
              <div className="flex items-center gap-1" id="el-bmq1jpjk">
                <Goal className='w-5 h-5 text-primary-400' />
                <span className="text-gray-700 " id="el-b06x4zpa">Accuracy Rate:</span>
              </div>
              <span className=" font-bold text-gray-800" id="el-dtkpces9">{overview?.overallSummary?.accuracyRate || 0}%</span>
            </div>
          </div>

          <div className="flex flex-col justify-between h-full" id="el-mytbouoa">
            <div>
              <h4 className="font-medium text-gray-800 mb-2" id="el-plvzw5le">Subject Breakdown</h4>
              <div className="space-y-3">
                {overview?.subjectWiseSummary?.length > 0 ? (overview?.subjectWiseSummary?.map((sm, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{sm?.subject}</span>
                      <span className="font-medium">Correct :{sm?.correctAnswers} </span>
                    </div>
                    <Progress value={sm?.accuracyRate} indicatorColor={` ${SubjectBackgroundColor[sm?.subject.toLowerCase() as keyof typeof SubjectBackgroundColor] || SubjectBackgroundColor.default}`} className="h-2.5" />
                  </div>
                ))) : (
                  <div className="flex flex-col items-center justify-center text-center py-10">
                    <h2 className="text-base font-semibold text-gray-800">
                      No subject-wise breakdown available
                    </h2>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div >
        
        <div className="bg-white rounded-xl border border-gray-200/30 shadow-sm p-6  ">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">AI Smart Suggestions</h3>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Personalized</span>
          </div>

          <div className="space-y-4 text-sm">
            {suggestions?.length > 0 ? suggestions?.map((suggestion, index) => {
              const style = suggestionTypeStyles[suggestion?.type] || {
                card: 'bg-gray-50 border-gray-200',
                button: 'bg-gray-400 text-white',
                buttonHover: '',
                text: 'text-gray-800'
              };
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${style.card}`}
                >
                  <p className={`${style.text}`}>{suggestion?.suggestion}</p>
                  {suggestion?.actionName && suggestion?.actionUrl && (
                    <button
                      type="button"
                      className={`mt-2 inline-block text-sm font-medium rounded ${style.text} cursor-pointer transition-transform duration-200 hover:translate-x-1`}
                      onClick={() => toast({
                        title: "This feature will be available soon!!",
                        variant: "default",
                        duration: 3000,
                        className: "bg-gray-100 text-gray-800",
                      })}
                    >
                      {suggestion?.actionName} →
                    </button>
                  )}
                </div>
              );
            }) : <p className="text-gray-500">No suggestions available for today.</p>}
          </div>
        </div>
      </div>

    </div>
  )
}

export default PracticeSummary