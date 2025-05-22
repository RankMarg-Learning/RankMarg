import React from 'react'
import MistakeOverview from './MistakeOverview'
import MistakeDistrubution from './MistakeDistrubution'
import MistakeInsights from './MistakeInsights'
import MistakeRecent from './MistakeRecent'

const MistakeTrackerDashboard = () => {
    return (
        <div>
            <div className="mb-8 md:space-y-6 space-y-3">
                {/* <div className="hidden" id="el-qg6wxqjk">
          <h2 className="text-lg font-medium  flex items-center gap-2">
            Mistake Tracker
          </h2>
          <p className="text-gray-600 text-sm">Track your conceptual progress across subjects and topics</p>

        </div> */}
                <MistakeOverview />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8" id="el-z33dzxua">
                    <div className='col-span-2'>
                        <MistakeDistrubution />
                    </div>
                        <MistakeInsights />
                </div>
                        <MistakeRecent/>

            </div>
        </div>
    )
}

export default MistakeTrackerDashboard