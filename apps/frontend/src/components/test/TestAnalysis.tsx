"use client"
import SectionA from "./analysis/SectionA"
import SectionB from "./analysis/SectionB"
import SectionC from "./analysis/SectionC"
import SectionD from "./analysis/SectionD"
import SectionE from "./analysis/SectionE"
import { useQuery } from "@tanstack/react-query"
import SkeletonAnalysis from "../skeleton/skel_analysis"
import { Alert, AlertDescription, Button } from "@repo/common-ui"
import { AlertCircle, BookOpen, CheckCircle2, XCircle, Clock } from "lucide-react"
import api from "@/utils/api"
import SectionG from "./analysis/SectionG"
import SectionH from "./analysis/SectionH"
import { ExamType } from "@repo/db/enums"
import ErrorCTA from "../error"

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
           <ErrorCTA message={error?.message || "Error loading test analysis. Please try again."} />
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
        <div className="container mx-auto p-2 space-y-4">
            

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
                    
                    {/* Section F: Question-wise Analysis - Replaced with Review Test Link */}
                    <div className="w-full">
                        <div className="bg-white rounded-lg border p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <BookOpen className="w-5 h-5" />
                                    Question-wise Review
                                </h3>
                                <Button
                                    onClick={() => {
                                        window.location.href = `/t/${testId}/review`;
                                    }}
                                    className="bg-yellow-400 hover:bg-yellow-500 text-black"
                                >
                                    Review All Questions
                                </Button>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                    Review all test questions with detailed solutions, hints, and explanations in an interactive test-like environment.
                                </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                        <span className="font-medium text-green-900">
                                            Correct: {testAnalysis.sectionF?.correctQuestions?.length || 0}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <XCircle className="w-4 h-4 text-red-600" />
                                        <span className="font-medium text-red-900">
                                            Incorrect: {testAnalysis.sectionF?.incorrectQuestions?.length || 0}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock className="w-4 h-4 text-gray-600" />
                                        <span className="font-medium text-gray-900">
                                            Unattempted: {testAnalysis.sectionF?.unattemptedQuestions?.length || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar with Recommendations and Comparative Analysis */}
                <div className="space-y-8">
                    {/* Section G: Improvement Recommendations */}
                    <SectionG analysis={testAnalysis.sectionG} examCode={testAnalysis.metadata?.examCode}/>
                    
                    {/* Section H: Comparative Analysis */}
                    <SectionH analysis={testAnalysis.sectionH}/>
                </div>
            </div>
        </div>
    )
}

