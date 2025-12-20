
export function getCategoryGradient(category: string | null): string {
  if (!category) {
    return "radial-gradient(120% 100% at 0% 0%, #fef3c7 0%, #fde68a 35%, #fcd34d 65%, #fbbf24 100%)";
  }

  const normalizedCategory = category.toUpperCase();

  const gradientMap: Record<string, string> = {
    "STUDY_TIPS": "radial-gradient(120% 100% at 0% 0%, #dbeafe 0%, #bfdbfe 35%, #93c5fd 65%, #60a5fa 100%)",
    "STUDY_STRATEGIES": "radial-gradient(120% 100% at 0% 0%, #dbeafe 0%, #bfdbfe 35%, #93c5fd 65%, #60a5fa 100%)",
    "EXAM_TIPS": "radial-gradient(120% 100% at 0% 0%, #e9d5ff 0%, #ddd6fe 35%, #c4b5fd 65%, #a78bfa 100%)",
    "EXAM_PREPARATION": "radial-gradient(120% 100% at 0% 0%, #e9d5ff 0%, #ddd6fe 35%, #c4b5fd 65%, #a78bfa 100%)",
    "EXAM": "radial-gradient(120% 100% at 0% 0%, #fce7f3 0%, #fbcfe8 35%, #f9a8d4 65%, #f472b6 100%)",
    "EXAM_REGISTRATION": "radial-gradient(120% 100% at 0% 0%, #fce7f3 0%, #fbcfe8 35%, #f9a8d4 65%, #f472b6 100%)",
    "TOPIC": "radial-gradient(120% 100% at 0% 0%, #d1fae5 0%, #a7f3d0 35%, #6ee7b7 65%, #34d399 100%)",
    "GUIDANCE": "radial-gradient(120% 100% at 0% 0%, #fed7aa 0%, #fdba74 35%, #fb923c 65%, #f97316 100%)",
    "COLLEGE": "radial-gradient(120% 100% at 0% 0%, #e0e7ff 0%, #c7d2fe 35%, #a5b4fc 65%, #818cf8 100%)",
    "COLLEGE_GUIDANCE": "radial-gradient(120% 100% at 0% 0%, #e0e7ff 0%, #c7d2fe 35%, #a5b4fc 65%, #818cf8 100%)",
    "TOOLS_AND_RESOURCES": "radial-gradient(120% 100% at 0% 0%, #cffafe 0%, #a5f3fc 35%, #67e8f9 65%, #22d3ee 100%)",
    "MOTIVATION": "radial-gradient(120% 100% at 0% 0%, #fce7f3 0%, #fbcfe8 35%, #f9a8d4 65%, #f472b6 100%)",
    "SUCCESS_STORIES": "radial-gradient(120% 100% at 0% 0%, #fce7f3 0%, #fbcfe8 35%, #f9a8d4 65%, #f472b6 100%)",
    "STORIES": "radial-gradient(120% 100% at 0% 0%, #fce7f3 0%, #fbcfe8 35%, #f9a8d4 65%, #f472b6 100%)",
    "INSPIRATION": "radial-gradient(120% 100% at 0% 0%, #fce7f3 0%, #fbcfe8 35%, #f9a8d4 65%, #f472b6 100%)",
    "COMPARISON": "radial-gradient(120% 100% at 0% 0%, #fce7f3 0%, #fbcfe8 35%, #f9a8d4 65%, #f472b6 100%)",
    "CAREER_GUIDANCE": "radial-gradient(120% 100% at 0% 0%, #e0e7ff 0%, #c7d2fe 35%, #a5b4fc 65%, #818cf8 100%)",
  };

  if (gradientMap[normalizedCategory]) {
    return gradientMap[normalizedCategory];
  }

  const hash = normalizedCategory.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const fallbackGradients = [
    "radial-gradient(120% 100% at 0% 0%, #fef3c7 0%, #fde68a 35%, #fcd34d 65%, #fbbf24 100%)",
    "radial-gradient(120% 100% at 0% 0%, #dbeafe 0%, #bfdbfe 35%, #93c5fd 65%, #60a5fa 100%)",
    "radial-gradient(120% 100% at 0% 0%, #e9d5ff 0%, #ddd6fe 35%, #c4b5fd 65%, #a78bfa 100%)",
    "radial-gradient(120% 100% at 0% 0%, #fce7f3 0%, #fbcfe8 35%, #f9a8d4 65%, #f472b6 100%)",
    "radial-gradient(120% 100% at 0% 0%, #fed7aa 0%, #fdba74 35%, #fb923c 65%, #f97316 100%)",
    "radial-gradient(120% 100% at 0% 0%, #d1fae5 0%, #a7f3d0 35%, #6ee7b7 65%, #34d399 100%)",
    "radial-gradient(120% 100% at 0% 0%, #cffafe 0%, #a5f3fc 35%, #67e8f9 65%, #22d3ee 100%)",
    "radial-gradient(120% 100% at 0% 0%, #e0e7ff 0%, #c7d2fe 35%, #a5b4fc 65%, #818cf8 100%)",
    "radial-gradient(120% 100% at 0% 0%, #ccfbf1 0%, #99f6e4 35%, #5eead4 65%, #2dd4bf 100%)",
    "radial-gradient(120% 100% at 0% 0%, #fef2f2 0%, #fee2e2 35%, #fecaca 65%, #fca5a5 100%)",
  ];

  const index = Math.abs(hash) % fallbackGradients.length;
  return fallbackGradients[index];
}


export function getCategoryBorderColor(category: string | null): string {
  if (!category) {
    return "#fbbf24";
  }

  const normalizedCategory = category.toUpperCase();

  const borderColorMap: Record<string, string> = {
    "STUDY_TIPS": "#60a5fa",
    "STUDY_STRATEGIES": "#60a5fa",
    "COMPARISON": "#60a5fa",
    "EXAM_TIPS": "#a78bfa",
    "EXAM_PREPARATION": "#a78bfa",
    "EXAM": "#a78bfa",
    "REGISTRATION": "#f472b6",
    "EXAM_REGISTRATION": "#f472b6",
    
    "TOPIC": "#34d399",
    "TOPIC_EXPLANATIONS": "#34d399",
    "GUIDANCE": "#f97316",
    
    "COLLEGE": "#818cf8",
    "COLLEGE_GUIDANCE": "#818cf8",
    
    "TOOLS_AND_RESOURCES": "#22d3ee",
    
    "MOTIVATION": "#f472b6",
    "SUCCESS_STORIES": "#f472b6",
    "STORIES": "#f472b6",
    "INSPIRATION": "#f472b6",
    "CAREER_GUIDANCE": "#818cf8",
  };

  if (borderColorMap[normalizedCategory]) {
    return borderColorMap[normalizedCategory];
  }

  const hash = normalizedCategory.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const fallbackColors = [
    "#fbbf24",
    "#60a5fa",
    "#a78bfa",
    "#f472b6",
    "#f97316",
    "#34d399",
    "#22d3ee",
    "#818cf8",
    "#2dd4bf",
    "#fca5a5",
  ];

  const index = Math.abs(hash) % fallbackColors.length;
  return fallbackColors[index];
}
