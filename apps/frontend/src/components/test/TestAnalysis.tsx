"use client"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import html2canvas from "html2canvas"
import SectionA from "./analysis/SectionA"
import SectionB from "./analysis/SectionB"
import SectionC from "./analysis/SectionC"
import SectionD from "./analysis/SectionD"
import SectionE from "./analysis/SectionE"
import { useQuery } from "@tanstack/react-query"
import SkeletonAnalysis from "../skeleton/skel_analysis"
import { Alert, AlertDescription, Button } from "@repo/common-ui"
import {
    AlertCircle,
    LayoutDashboard,
    TrendingUp,
    Clock,
    Target,
    BookOpen,
    Lightbulb,
    GitCompare,
    ChevronRight,
    ArrowRight,
    Share
} from "lucide-react"
import api from "@/utils/api"
import SectionG from "./analysis/SectionG"
import SectionH from "./analysis/SectionH"
import { ExamType } from "@repo/db/enums"
import ErrorCTA from "../error"

export default function TestAnalysisPage({ testId }: { testId: string }) {
    const [activeStep, setActiveStep] = useState("overview")
    const router = useRouter()
    const shareRef = useRef<HTMLDivElement>(null)

    const handleShare = async () => {
        if (!shareRef.current) return
        try {
            const canvas = await html2canvas(shareRef.current, {
                scale: 3, // Higher quality
                backgroundColor: "#F8FAFC", // slate-50
                useCORS: true
            })
            const image = canvas.toDataURL("image/png")
            const link = document.createElement("a")
            link.href = image
            link.download = `test-analysis-${testId}.png`
            link.click()
        } catch (error) {
            console.error("Error generating share image:", error)
        }
    }

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["testAnalysis", testId],
        queryFn: async () => {
            const { data } = await api.get(`/test/${testId}/analysis`)
            return data
        },
        retry: 2,
        staleTime: 5 * 60 * 1000,
    })
    const testAnalysis = data?.data

    if (isLoading) return <SkeletonAnalysis />

    if (isError) {
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

    const steps = [
        {
            id: "overview",
            label: "Overview",
            icon: LayoutDashboard,
            component: <SectionA analysis={testAnalysis.sectionA} />
        },
        {
            id: "performance",
            label: "Performance",
            icon: TrendingUp,
            component: <SectionB analysis={testAnalysis.sectionB} />
        },
        {
            id: "time",
            label: "Time",
            icon: Clock,
            component: <SectionC analysis={testAnalysis.sectionC} />
        },
        {
            id: "difficulty",
            label: "Difficulty",
            icon: Target,
            component: <SectionD analysis={testAnalysis.sectionD} />
        },
        ...(testAnalysis.metadata?.examType === ExamType.FULL_LENGTH ? [{
            id: "subjects",
            label: "Subjects",
            icon: BookOpen,
            component: <SectionE analysis={testAnalysis.sectionE} />
        }] : []),
        {
            id: "recommendations",
            label: "Coach",
            icon: Lightbulb,
            component: <SectionG analysis={testAnalysis.sectionG} examCode={testAnalysis.metadata?.examCode} />
        },
        {
            id: "comparative",
            label: "Compare",
            icon: GitCompare,
            component: <SectionH analysis={testAnalysis.sectionH} />
        }
    ]

    const activeStepData = steps.find(s => s.id === activeStep)
    const activeComponent = activeStepData?.component

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] ">
            <div className="flex flex-1 overflow-hidden lg:flex-row">

                <div className="hidden lg:flex w-56 flex-col  bg-card/50 backdrop-blur-sm p-2 space-y-2 h-full overflow-y-auto">
                    <div className="flex items-center gap-3 mb-4 pl-1">
                        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Analysis Sections</h2>
                    </div>
                    {steps.map((step) => {
                        const Icon = step.icon
                        const isActive = activeStep === step.id
                        return (
                            <button
                                key={step.id}
                                onClick={() => setActiveStep(step.id)}
                                className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium w-full
                                    ${isActive
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 translate-x-1"
                                        : "hover:bg-primary/10 hover:text-primary-foreground text-muted-foreground hover:translate-x-1"
                                    }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                                    <span>{step.label}</span>
                                </div>
                                <ChevronRight className={`w-4 h-4 transition-all duration-200 ${isActive
                                    ? "opacity-100 translate-x-0"
                                    : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                                    }`} />
                            </button>
                        )
                    })}
                </div>

                <div className="flex-1 h-full overflow-y-auto  p-3 lg:p-4 scroll-smooth ">
                    <div className="max-w-5xl mx-auto space-y-0 animate-in fade-in duration-500 slide-in-from-bottom-4">
                        <div className="flex items-center justify-end pb-2 gap-2 ">
                            <Button
                                onClick={handleShare}
                                variant="outline"
                                className="w-10 h-10 rounded-full"
                            >

                                <Share className="w-4 h-4 " />
                            </Button>
                            <Button
                                onClick={() => router.push(`/t/${testId}/review`)}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-full shadow hover:bg-primary/90 transition-colors"
                            >
                                View Solutions
                                <ArrowRight className="w-4 h-4 " />
                            </Button>
                        </div>
                        {activeComponent}
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Badge Navigation */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 px-2 py-3 safe-area-pb shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-start overflow-x-auto no-scrollbar gap-2 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {steps.map((step) => {
                        const Icon = step.icon
                        const isActive = activeStep === step.id
                        return (
                            <button
                                key={step.id}
                                onClick={() => {
                                    setActiveStep(step.id)
                                    window.scrollTo({ top: 0, behavior: "smooth" })
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all
                                    ${isActive
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{step.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>
            {/* Hidden Shareable Component */}
            <div className="fixed left-[-9999px] top-0 pointer-events-none">
                <div
                    ref={shareRef}
                    className="w-[1080px] h-fit bg-slate-50 p-12 font-sans relative overflow-hidden"
                >
                    {/* Watermark/Background decoration */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-bl-full -mr-20 -mt-20 z-0" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-tr-full -ml-20 -mb-20 z-0" />

                    <div className="relative z-10">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-10">
                            <div className="flex flex-col gap-1.5">
                                <img src="/logo.png" alt="Logo" width={200} height={200} />
                                <p className="text-base text-slate-500 font-medium pl-1">LEARN•SOLVE•ACHEIVE</p>
                            </div>

                            <div className="text-right px-6 py-3 rounded-xl shadow-sm border border-slate-100/50">
                                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">GENERATED ON</p>
                                <p className="text-lg font-semibold text-slate-700">
                                    {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        {/* Main Content - Force desktop layout and clean spacing */}
                        <div className="space-y-6 [&>div]:!p-0 [&>div]:!bg-transparent [&>div]:!shadow-none [&>div]:!border-none [&>div]:!space-y-8 [&_h2]:!pl-0">
                            {testAnalysis && <SectionA analysis={testAnalysis.sectionA} />}
                        </div>

                        {/* Footer */}
                        <div className="mt-10 flex items-center justify-between pt-8 border-t border-slate-200/60">
                            <div className="flex items-center gap-2.5">
                                <p className="text-sm font-medium text-slate-500">Verified Performance Report</p>
                            </div>
                            <div className="flex items-center gap-6 text-sm font-medium text-slate-400">
                                <span>www.rankmarg.in</span>
                                <span>•</span>
                                <span>AI-Powered Analysis</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

