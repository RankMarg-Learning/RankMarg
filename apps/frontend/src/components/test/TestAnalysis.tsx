"use client"
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

    console.log(testAnalysis)

    return (
        <div className="flex flex-col lg:flex-row">
            <main className="flex-1  space-y-6">
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
            
        </div>
    )
}

