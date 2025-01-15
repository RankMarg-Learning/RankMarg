"use client"
import { Card, CardContent, } from "@/components/ui/card"
import SectionA from "./analysis/SectionA"
import SectionB from "./analysis/SectionB"
import SectionC from "./analysis/SectionC"
import SectionD from "./analysis/SectionD"
import SectionE from "./analysis/SectionE"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import SkeletonAnalysis from "../skeleton/skel_analysis"

export default function TestAnalysisPage({testId}:{testId:string}) {

    const {data:testAnalysis, isLoading, isError} = useQuery({
        queryKey: ["testAnalysis", testId],
        queryFn: async() => {
            const {data} = await axios.get(`/api/test/${testId}/analysis`)
            return data
        }
    })
    
    if(isLoading) return <SkeletonAnalysis/>
    
    if(isError) return <div>Error loading test analysis</div>

    

    return (
        <div className="flex flex-col lg:flex-row">
            {/* Left Sidebar - Hidden on mobile, 1/6 width on large screens */}
            <aside className="hidden lg:block w-1/12 p-4 ">
                <div className="space-y-4">
                    <Card className="hidden">
                        <CardContent className="p-4">
                            <h3 className="font-semibold mb-2">Left Ad Space</h3>
                            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                                Future Ad
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </aside>

            {/* Main Content - Full width on mobile, 2/3 width on large screens */}
            <main className="flex-1 lg:w-2/3 md:p-4 p-2  space-y-6">
                {/* Header Section */}
                <SectionA analysis={testAnalysis?.sectionA}/>
                {/* Performance Metrics */}
                <SectionB analysis={testAnalysis?.sectionB}/>
                {/* Time Distribution Analysis */}
                <SectionC analysis={testAnalysis?.sectionC}/>
                {/* Difficulty Level Analysis */}
                <SectionD analysis={testAnalysis?.sectionD}/>
                {/* Question Analysis */}
                <SectionE analysis={testAnalysis?.sectionE}/>
            </main>

            {/* Right Sidebar - Hidden on mobile, 1/6 width on large screens */}
            <aside className="hidden lg:block w-1/12 p-4 ">
                <div className="space-y-4">
                    <Card className="hidden">
                        <CardContent className="p-4">
                            <h3 className="font-semibold mb-2">Right Ad Space</h3>
                            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                                Future Ad
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </aside>
        </div>
    )
}

