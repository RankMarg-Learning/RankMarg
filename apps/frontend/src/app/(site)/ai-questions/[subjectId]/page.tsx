"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { aiQuestionService, Topic } from "@/services/aiQuestion.service";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SubjectTopicsPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const subjectId = params.subjectId as string;

  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (subjectId) {
      fetchTopics();
    }
  }, [subjectId]);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const data = await aiQuestionService.getTopicsBySubject(subjectId);
      setTopics(data);
    } catch (error: any) {
      console.error("Error fetching topics:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to load topics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTopicClick = (topicSlug: string | null) => {
    if (!topicSlug) {
      toast({
        title: "Error",
        description: "Invalid topic",
        variant: "destructive",
      });
      return;
    }
    router.push(`/ai-questions/${subjectId}/${topicSlug}`);
  };

  

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      {/* Header Section */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Subjects
        </Button>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Select a Topic
        </h1>
        <p className="text-gray-600 text-base">
          Choose a topic to practice AI-powered questions
        </p>
      </div>

      {/* Topics Grid */}
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
      ) : topics.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Topics Available
            </h3>
            <p className="text-gray-600 mb-4">
              There are no topics available for this subject at the moment.
            </p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Subjects
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <Card
            key={topic.id}
            onClick={() => handleTopicClick(topic.slug)}
            className="group cursor-pointer rounded-xl border-2 border-gray-100 bg-white hover:border-primary-300 hover:shadow-lg transition-all duration-200 p-5 flex items-center justify-between"
          >
            <div className="flex flex-col flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-800 group-hover:text-primary-600 transition-colors truncate">
                {topic.name}
              </h3>
             
            </div>
          
            <div className="flex items-center gap-2">
              
              <div className="p-2 rounded-md group-hover:bg-primary-50 transition-colors">
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
              </div>
            </div>
          </Card>
          ))}
        </div>
      )}
    </div>
  );
}

