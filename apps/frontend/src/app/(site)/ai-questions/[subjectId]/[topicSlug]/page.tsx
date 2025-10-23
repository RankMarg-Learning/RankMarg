"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import AiTopicQuestionSession from "@/components/AiTopicQuestionSession";
import AiQuestionHistory from "@/components/AiQuestionHistory";

type ViewMode = "solve" | "history";

export default function AIQuestionsTopicPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const topicSlug = params.topicSlug as string;

  // Get initial view mode from URL params
  const initialViewMode = (searchParams.get('view') === 'history' ? 'history' : 'solve') as ViewMode;
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);

  // Update URL when view mode changes
  useEffect(() => {
    const currentParams = new URLSearchParams(window.location.search);
    if (viewMode === 'history') {
      currentParams.set('view', 'history');
    } else {
      currentParams.delete('view');
    }
    
    const newUrl = `${window.location.pathname}${currentParams.toString() ? '?' + currentParams.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [viewMode]);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  if (viewMode === "history") {
    return (
      <AiQuestionHistory 
        topicSlug={topicSlug} 
        onBack={() => handleViewModeChange("solve")}
      />
    );
  }

  return (
    <div className="relative">
      
      {/* Main Question Solving Session */}
      <AiTopicQuestionSession 
        topicSlug={topicSlug}
        onViewHistory={() => handleViewModeChange("history")}
      />
    </div>
  );
}
