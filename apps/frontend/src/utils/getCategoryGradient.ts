/**
 * Get gradient color combination based on article category
 * @param category - The article category string (can be null)
 * @returns A CSS radial-gradient string
 */
export function getCategoryGradient(category: string | null): string {
  if (!category) {
    // Default gradient (light gold theme) - using spaces for CSS compatibility
    return "radial-gradient(120% 100% at 0% 0%, #fef3c7 0%, #fde68a 35%, #fcd34d 65%, #fbbf24 100%)";
  }

  // Normalize category to uppercase for consistent mapping
  const normalizedCategory = category.toUpperCase();

  // Map categories to different gradient combinations - using light colors for CSS compatibility
  const gradientMap: Record<string, string> = {
    // Study Tips & Strategies
    "STUDY_TIPS": "radial-gradient(120% 100% at 0% 0%, #dbeafe 0%, #bfdbfe 35%, #93c5fd 65%, #60a5fa 100%)",
    "STUDY_STRATEGIES": "radial-gradient(120% 100% at 0% 0%, #dbeafe 0%, #bfdbfe 35%, #93c5fd 65%, #60a5fa 100%)",
    
    // Exam Preparation
    "EXAM_TIPS": "radial-gradient(120% 100% at 0% 0%, #e9d5ff 0%, #ddd6fe 35%, #c4b5fd 65%, #a78bfa 100%)",
    "EXAM_PREPARATION": "radial-gradient(120% 100% at 0% 0%, #e9d5ff 0%, #ddd6fe 35%, #c4b5fd 65%, #a78bfa 100%)",
    
    // Exam Registration
    "REGISTRATION": "radial-gradient(120% 100% at 0% 0%, #fce7f3 0%, #fbcfe8 35%, #f9a8d4 65%, #f472b6 100%)",
    "EXAM_REGISTRATION": "radial-gradient(120% 100% at 0% 0%, #fce7f3 0%, #fbcfe8 35%, #f9a8d4 65%, #f472b6 100%)",
    
    // Topic Explanations
    "TOPIC_EXPLAINS": "radial-gradient(120% 100% at 0% 0%, #d1fae5 0%, #a7f3d0 35%, #6ee7b7 65%, #34d399 100%)",
    "TOPIC_EXPLANATIONS": "radial-gradient(120% 100% at 0% 0%, #d1fae5 0%, #a7f3d0 35%, #6ee7b7 65%, #34d399 100%)",
    
    // Parent Guidance
    "PARENT_GUIDANCE": "radial-gradient(120% 100% at 0% 0%, #fed7aa 0%, #fdba74 35%, #fb923c 65%, #f97316 100%)",
    
    // Colleges
    "COLLEGES": "radial-gradient(120% 100% at 0% 0%, #e0e7ff 0%, #c7d2fe 35%, #a5b4fc 65%, #818cf8 100%)",
    "COLLEGE_GUIDANCE": "radial-gradient(120% 100% at 0% 0%, #e0e7ff 0%, #c7d2fe 35%, #a5b4fc 65%, #818cf8 100%)",
    
    // Tools & Resources
    "TOOLS_RESOURCES": "radial-gradient(120% 100% at 0% 0%, #cffafe 0%, #a5f3fc 35%, #67e8f9 65%, #22d3ee 100%)",
    "TOOLS_AND_RESOURCES": "radial-gradient(120% 100% at 0% 0%, #cffafe 0%, #a5f3fc 35%, #67e8f9 65%, #22d3ee 100%)",
    
    // Motivation & Success Stories
    "MOTIVATION": "radial-gradient(120% 100% at 0% 0%, #fce7f3 0%, #fbcfe8 35%, #f9a8d4 65%, #f472b6 100%)",
    "SUCCESS_STORIES": "radial-gradient(120% 100% at 0% 0%, #fce7f3 0%, #fbcfe8 35%, #f9a8d4 65%, #f472b6 100%)",
    "STORIES": "radial-gradient(120% 100% at 0% 0%, #fce7f3 0%, #fbcfe8 35%, #f9a8d4 65%, #f472b6 100%)",
    "INSPIRATION": "radial-gradient(120% 100% at 0% 0%, #fce7f3 0%, #fbcfe8 35%, #f9a8d4 65%, #f472b6 100%)",
    
    // Career Guidance
    "CAREER_GUIDANCE": "radial-gradient(120% 100% at 0% 0%, #e0e7ff 0%, #c7d2fe 35%, #a5b4fc 65%, #818cf8 100%)",
    "CAREER": "radial-gradient(120% 100% at 0% 0%, #e0e7ff 0%, #c7d2fe 35%, #a5b4fc 65%, #818cf8 100%)",
  };

  // Check if we have a direct match
  if (gradientMap[normalizedCategory]) {
    return gradientMap[normalizedCategory];
  }

  // For unknown categories, use a hash-based approach for consistent colors
  // This ensures the same category always gets the same gradient
  const hash = normalizedCategory.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  // Predefined set of beautiful light gradients for unknown categories - using spaces for CSS compatibility
  const fallbackGradients = [
    "radial-gradient(120% 100% at 0% 0%, #fef3c7 0%, #fde68a 35%, #fcd34d 65%, #fbbf24 100%)", // Light Gold (default)
    "radial-gradient(120% 100% at 0% 0%, #dbeafe 0%, #bfdbfe 35%, #93c5fd 65%, #60a5fa 100%)", // Light Blue
    "radial-gradient(120% 100% at 0% 0%, #e9d5ff 0%, #ddd6fe 35%, #c4b5fd 65%, #a78bfa 100%)", // Light Purple
    "radial-gradient(120% 100% at 0% 0%, #fce7f3 0%, #fbcfe8 35%, #f9a8d4 65%, #f472b6 100%)", // Light Pink
    "radial-gradient(120% 100% at 0% 0%, #fed7aa 0%, #fdba74 35%, #fb923c 65%, #f97316 100%)", // Light Orange
    "radial-gradient(120% 100% at 0% 0%, #d1fae5 0%, #a7f3d0 35%, #6ee7b7 65%, #34d399 100%)", // Light Green
    "radial-gradient(120% 100% at 0% 0%, #cffafe 0%, #a5f3fc 35%, #67e8f9 65%, #22d3ee 100%)", // Light Cyan
    "radial-gradient(120% 100% at 0% 0%, #e0e7ff 0%, #c7d2fe 35%, #a5b4fc 65%, #818cf8 100%)", // Light Indigo
    "radial-gradient(120% 100% at 0% 0%, #ccfbf1 0%, #99f6e4 35%, #5eead4 65%, #2dd4bf 100%)", // Light Teal
    "radial-gradient(120% 100% at 0% 0%, #fef2f2 0%, #fee2e2 35%, #fecaca 65%, #fca5a5 100%)", // Light Red
  ];

  const index = Math.abs(hash) % fallbackGradients.length;
  return fallbackGradients[index];
}

/**
 * Get border color based on article category
 * @param category - The article category string (can be null)
 * @returns A CSS color string for the border
 */
export function getCategoryBorderColor(category: string | null): string {
  if (!category) {
    // Default border color (gold)
    return "#fbbf24";
  }

  // Normalize category to uppercase for consistent mapping
  const normalizedCategory = category.toUpperCase();

  // Map categories to border colors (darker/more saturated versions of gradient colors)
  const borderColorMap: Record<string, string> = {
    // Study Tips & Strategies - Blue
    "STUDY_TIPS": "#60a5fa",
    "STUDY_STRATEGIES": "#60a5fa",
    
    // Exam Preparation - Purple
    "EXAM_TIPS": "#a78bfa",
    "EXAM_PREPARATION": "#a78bfa",
    
    // Exam Registration - Pink
    "REGISTRATION": "#f472b6",
    "EXAM_REGISTRATION": "#f472b6",
    
    // Topic Explanations - Green
    "TOPIC_EXPLAINS": "#34d399",
    "TOPIC_EXPLANATIONS": "#34d399",
    
    // Parent Guidance - Orange
    "PARENT_GUIDANCE": "#f97316",
    
    // Colleges - Indigo
    "COLLEGES": "#818cf8",
    "COLLEGE_GUIDANCE": "#818cf8",
    
    // Tools & Resources - Cyan
    "TOOLS_RESOURCES": "#22d3ee",
    "TOOLS_AND_RESOURCES": "#22d3ee",
    
    // Motivation & Success Stories - Pink
    "MOTIVATION": "#f472b6",
    "SUCCESS_STORIES": "#f472b6",
    "STORIES": "#f472b6",
    "INSPIRATION": "#f472b6",
    
    // Career Guidance - Indigo
    "CAREER_GUIDANCE": "#818cf8",
    "CAREER": "#818cf8",
  };

  // Check if we have a direct match
  if (borderColorMap[normalizedCategory]) {
    return borderColorMap[normalizedCategory];
  }

  // For unknown categories, use a hash-based approach for consistent colors
  const hash = normalizedCategory.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  // Predefined set of border colors for unknown categories
  const fallbackColors = [
    "#fbbf24", // Gold (default)
    "#60a5fa", // Blue
    "#a78bfa", // Purple
    "#f472b6", // Pink
    "#f97316", // Orange
    "#34d399", // Green
    "#22d3ee", // Cyan
    "#818cf8", // Indigo
    "#2dd4bf", // Teal
    "#fca5a5", // Red
  ];

  const index = Math.abs(hash) % fallbackColors.length;
  return fallbackColors[index];
}
