"use client"
import SectionA from "./analysis/SectionA"
import SectionB from "./analysis/SectionB"
import SectionC from "./analysis/SectionC"
import SectionD from "./analysis/SectionD"
import SectionE from "./analysis/SectionE"
import SectionF from "./analysis/SectionF"
import { useQuery } from "@tanstack/react-query"
import SkeletonAnalysis from "../skeleton/skel_analysis"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import api from "@/utils/api"
import SectionG from "./analysis/SectionG"
import SectionH from "./analysis/SectionH"
import { ExamType } from "@repo/db/enums"

export default function TestAnalysisPage({testId}:{testId:string}) {

    const {data, isLoading, isError, error} = useQuery({
        queryKey: ["testAnalysis", testId],
        queryFn: async() => {
            const {data} = await api.get(`/test/${testId}/analysis`)
            return data
        },
        retry: 2,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
    const testAnalysis = data?.data
    if(isLoading) return <SkeletonAnalysis/>
    
    if(isError) {
        return (
            <div className="container mx-auto p-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {error?.message || "Error loading test analysis. Please try again."}
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    if (!testAnalysis) {
        return (
            <div className="container mx-auto p-6">
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        No analysis data available for this test.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Analysis Sections */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Section A: Test Overview */}
                    <SectionA analysis={testAnalysis.sectionA}/>
                    
                    {/* Section B: Performance Metrics */}
                    <SectionB analysis={testAnalysis.sectionB}/>
                    
                    {/* Section C: Time Analysis */}
                    <SectionC analysis={testAnalysis.sectionC}/>
                    
                    {/* Section D: Difficulty Analysis */}
                    <SectionD analysis={testAnalysis.sectionD}/>
                    
                    {/* Section E: Subject-wise Analysis */}
                    {
                        testAnalysis.metadata?.examType === ExamType.FULL_LENGTH && (

                            <SectionE analysis={testAnalysis.sectionE}/>
                        )
                    }
                    
                    {/* Section F: Question-wise Analysis */}
                    <SectionF analysis={testAnalysis.sectionF}/>
                </div>

                {/* Sidebar with Recommendations and Comparative Analysis */}
                <div className="space-y-8">
                    {/* Section G: Improvement Recommendations */}
                    <SectionG analysis={testAnalysis.sectionG}/>
                    
                    {/* Section H: Comparative Analysis */}
                    <SectionH analysis={testAnalysis.sectionH}/>
                </div>
            </div>
        </div>
    )
}

