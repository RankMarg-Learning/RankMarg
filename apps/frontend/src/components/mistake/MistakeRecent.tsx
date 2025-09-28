import React from 'react'

const MistakeRecent = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4" id="el-apnx8tx6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-3" id="el-flnvrvy0">
            <h3 className="text-base font-semibold text-gray-800 mb-2 md:mb-0" id="el-z3yfj62i">Recent Mistakes</h3>
            
            {/* <!-- Filter Controls --> */}
            <div className="flex flex-wrap gap-1.5" id="el-cukzbvgl">
                <select id="subjectFilter" className="px-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-md focus:outline-none">
                    <option value="all" id="el-15245er6">All Subjects</option>
                    <option value="physics" id="el-0levroil">Physics</option>
                    <option value="chemistry" id="el-ghwqmnez">Chemistry</option>
                    <option value="mathematics" id="el-vtr0ho6d">Mathematics</option>
                    <option value="biology" id="el-hoh2jacn">Biology</option>
                </select>
                
                <select id="typeFilter" className="px-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-md focus:outline-none">
                    <option value="all" id="el-j88dvant">All Types</option>
                    <option value="concept" id="el-2u7rap1p">Concept not clear</option>
                    <option value="calculation" id="el-ofw77dx1">Calculation mistake</option>
                    <option value="guessed" id="el-z4li5bsm">Guessed</option>
                    <option value="misread" id="el-4gqvts7i">Misread question</option>
                    <option value="silly" id="el-ywwl2slg">Silly error</option>
                </select>
                
                <select id="dateFilter" className="px-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-md focus:outline-none">
                    <option value="all" id="el-rf07ypju">All Time</option>
                    <option value="today" id="el-6m3zvcak">Today</option>
                    <option value="week" id="el-hmp3v98w">This Week</option>
                    <option value="month" id="el-s83vlegt">This Month</option>
                </select>
                
                <button id="applyFilters" className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition">Apply</button>
            </div>
        </div>
        
        <div className="overflow-x-auto" id="el-7ac1ytfw">
            <table className="min-w-full" id="el-29fg0ebq">
                <thead id="el-ydayyzoe">
                    <tr className="border-b border-gray-200" id="el-gdw4z55w">
                        <th className="text-left py-2 px-3 font-medium text-xs text-gray-500" id="el-ggiiabpl">Question</th>
                        <th className="text-left py-2 px-3 font-medium text-xs text-gray-500" id="el-6441z82p">Subject</th>
                        <th className="text-left py-2 px-3 font-medium text-xs text-gray-500" id="el-1pn969im">Topic</th>
                        <th className="text-left py-2 px-3 font-medium text-xs text-gray-500" id="el-e19l7ro4">Type</th>
                        <th className="text-left py-2 px-3 font-medium text-xs text-gray-500" id="el-rs9jg5tm">Date</th>
                        <th className="text-left py-2 px-3 font-medium text-xs text-gray-500" id="el-kffl8ve9">Actions</th>
                    </tr>
                </thead>
                <tbody id="el-rlr9il4l">
                    <tr className="border-b border-gray-100" id="el-2f7nc148">
                        <td className="py-2 px-3 text-xs" id="el-dn7550yp">A ball is thrown vertically upward with a velocity of 20 m/s...</td>
                        <td className="py-2 px-3 text-xs" id="el-5ij1nvzl">Physics</td>
                        <td className="py-2 px-3 text-xs" id="el-ejzrynyn">Mechanics</td>
                        <td className="py-2 px-3 text-xs" id="el-aj6d27o2"><span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full text-xs" id="el-cfyypc1y">Concept</span></td>
                        <td className="py-2 px-3 text-xs text-gray-500" id="el-95o7cu8v">Today</td>
                        <td className="py-2 px-3 text-xs" id="el-1487mjvd">
                            <button className="text-blue-600 hover:underline mr-2" id="openMistakeDetailModalBtn1">View</button>
                            <button className="text-red-600 hover:underline" id="el-x6otg2sx">Retry</button>
                        </td>
                    </tr>
                    <tr className="border-b border-neutral-200/20" id="el-u2y47xxx">
                        <td className="py-3 px-4 text-sm" id="el-9xdc9tn4">Calculate the definite integral of (x²+3x+2) from x=0 to x=2...</td>
                        <td className="py-3 px-4 text-sm" id="el-ykhdkqe4">Mathematics</td>
                        <td className="py-3 px-4 text-sm" id="el-kvg5fzyy">Integration</td>
                        <td className="py-3 px-4 text-sm" id="el-mu3s1p5v"><span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs" id="el-5naqe1pn">Calculation mistake</span></td>
                        <td className="py-3 px-4 text-sm text-gray-500" id="el-fgw1777v">Yesterday</td>
                        <td className="py-3 px-4 text-sm" id="el-dxwb2ee6">
                            <button className="text-blue-600 hover:underline mr-2" id="el-ee4bmupy">View</button>
                            <button className="text-red-600 hover:underline" id="el-bf1dai72">Retry</button>
                        </td>
                    </tr>
                    <tr className="border-b border-neutral-200/20" id="el-wggvjpxv">
                        <td className="py-3 px-4 text-sm" id="el-6rl3k9gn">Which of the following functional groups show highest priority in IUPAC nomenclature?</td>
                        <td className="py-3 px-4 text-sm" id="el-vjct831y">Chemistry</td>
                        <td className="py-3 px-4 text-sm" id="el-kvnl6319">Organic Chemistry</td>
                        <td className="py-3 px-4 text-sm" id="el-vjyrsf76"><span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs" id="el-lxj9o8wc">Guessed</span></td>
                        <td className="py-3 px-4 text-sm text-gray-500" id="el-97s8todd">2 days ago</td>
                        <td className="py-3 px-4 text-sm" id="el-tqd1sb2v">
                            <button className="text-blue-600 hover:underline mr-2" id="el-5h06ib0p">View</button>
                            <button className="text-red-600 hover:underline" id="el-d9eysb3h">Retry</button>
                        </td>
                    </tr>
                    <tr className="border-b border-neutral-200/20" id="el-zdkmpxpg">
                        <td className="py-3 px-4 text-sm" id="el-qsth4h3l">The electric field at a point due to a point charge is 9 N/C. If the distance...</td>
                        <td className="py-3 px-4 text-sm" id="el-3cg2q3du">Physics</td>
                        <td className="py-3 px-4 text-sm" id="el-w61cspdt">Electrostatics</td>
                        <td className="py-3 px-4 text-sm" id="el-tsedzddt"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs" id="el-c54qn68u">Misread question</span></td>
                        <td className="py-3 px-4 text-sm text-gray-500" id="el-uzcwf5uc">3 days ago</td>
                        <td className="py-3 px-4 text-sm" id="el-ldxn8z95">
                            <button className="text-blue-600 hover:underline mr-2" id="el-300rreo0">View</button>
                            <button className="text-red-600 hover:underline" id="el-sczm9gww">Retry</button>
                        </td>
                    </tr>
                    <tr className="border-b border-neutral-200/20" id="el-jx14kgv7">
                        <td className="py-3 px-4 text-sm" id="el-rq0fq1ru">The pH of a solution with [H+] = 4 × 10⁻⁵ is...</td>
                        <td className="py-3 px-4 text-sm" id="el-h4h45oxs">Chemistry</td>
                        <td className="py-3 px-4 text-sm" id="el-80tja50v">Acids &amp; Bases</td>
                        <td className="py-3 px-4 text-sm" id="el-c97podwk"><span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs" id="el-o0yvcnfk">Silly error</span></td>
                        <td className="py-3 px-4 text-sm text-gray-500" id="el-icmjk06g">4 days ago</td>
                        <td className="py-3 px-4 text-sm" id="el-0pn245a6">
                            <button className="text-blue-600 hover:underline mr-2" id="el-xn13a1gy">View</button>
                            <button className="text-red-600 hover:underline" id="el-whf36le5">Retry</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div className="mt-4 flex justify-between items-center" id="el-js57v79n">
            <div className="text-sm text-gray-500" id="el-ngck62il">
                Showing 5 of 124 mistakes
            </div>
            <div className="flex space-x-2" id="el-wajg2w2q">
                <button className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 disabled:opacity-50" id="el-ft0w76ra">Previous</button>
                <button className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50" id="el-ay2lsn2r">Next</button>
            </div>
        </div>
    </div>
  )
}

export default MistakeRecent