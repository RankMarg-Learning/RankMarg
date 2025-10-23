"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { aiQuestionService, Subject } from "@/services/aiQuestion.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, ArrowRight, Trophy, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SubjectBackgroundColor, SubjectCardColor, SubjectTextColor } from "@/constant/SubjectColorCode";

export default function AIQuestionsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [userStats, setUserStats] = useState<{
        userGrade: string;
        totalAttempted: number;
        accuracy: number;
    } | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [subjectsData] = await Promise.all([
                aiQuestionService.getSubjects(),
            ]);
            setSubjects(subjectsData);
        } catch (error: any) {
            console.error("Error fetching data:", error);
            toast({
                title: "Error",
                description: error?.message || "Failed to load subjects. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubjectClick = (subjectId: string) => {
        router.push(`/ai-questions/${subjectId}`);
    };

    const getGradeColor = (grade: string) => {
        switch (grade) {
            case "A_PLUS":
                return "text-green-600";
            case "A":
                return "text-blue-600";
            case "B":
                return "text-yellow-600";
            case "C":
                return "text-orange-600";
            case "D":
                return "text-red-600";
            default:
                return "text-gray-600";
        }
    };

   

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl space-y-4">
            {/* Header Section */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            AI-Powered Practice Questions
                        </h1>
                        <p className="text-gray-600 text-base">
                            Smart questions tailored to your performance level
                        </p>
                    </div>

                </div>


            </div>

            {/* Subjects Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : subjects.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No Subjects Available
                        </h3>
                        <p className="text-gray-600">
                            There are no subjects available for AI questions at the moment.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map((subject) => (
                        <Card
                            key={subject.id}
                            className={`hover:shadow-lg transition-shadow cursor-pointer group ${SubjectCardColor[subject.name.toLowerCase() as keyof typeof SubjectCardColor] ||
                                SubjectCardColor.default
                                }`}
                            onClick={() => handleSubjectClick(subject.id)}
                        >
                            <CardHeader>
                                <CardTitle className={`text-xl  `}>{subject.name}</CardTitle>
                                <CardDescription className={`text-sm  ${SubjectTextColor[subject.name.toLowerCase() as keyof typeof SubjectTextColor] ||
                                    SubjectTextColor.default
                                    } text-sm text-muted-foreground `}>{subject.topicCount} topics • {subject.questionCount} questions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    className={`w-full group-hover:bg-primary-600 transition-colors ${SubjectBackgroundColor[subject.name.toLowerCase() as keyof typeof SubjectBackgroundColor] ||
                                        SubjectBackgroundColor.default
                                        }`}
                                    variant="default"
                                >
                                    Start Practice
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
            {/* Info Card */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-600 rounded-lg">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">
                                How AI Questions Work
                            </h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>✓ Questions adapt to your current grade level</li>
                                <li>✓ Excludes questions you've already attempted</li>
                                <li>✓ Focuses on topics that match your learning path</li>
                                <li>✓ Available only for premium subscribers</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

