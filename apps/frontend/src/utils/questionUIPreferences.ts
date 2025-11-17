/**
 * Question UI Preferences Utility
 * Manages user preferences for what to show/hide in the question interface
 */

export interface QuestionUIPreferences {
  // Main sections
  showHint: boolean;
  showDetailedSolution: boolean;
  showStrategy: boolean;
  showCommonMistakes: boolean;
  
  // Solution content filters (from solutionFilter)
  solutionContentFilters: {
    'shortcut-trick': boolean;
    'did-you-know': boolean;
    'exploratory': boolean;
    'if-then-scenario': boolean;
    'key-insight': boolean;
    'pro-tip': boolean;
    'quick-recall': boolean;
  };
}

// Default preferences - all features enabled
export const DEFAULT_UI_PREFERENCES: QuestionUIPreferences = {
  showHint: true,
  showDetailedSolution: true,
  showStrategy: true,
  showCommonMistakes: true,
  solutionContentFilters: {
    'shortcut-trick': true,
    'did-you-know': true,
    'exploratory': true,
    'if-then-scenario': true,
    'key-insight': true,
    'pro-tip': true,
    'quick-recall': true,
  },
};

export interface PreferenceInfo {
  key: keyof Omit<QuestionUIPreferences, 'solutionContentFilters'>;
  label: string;
  description: string;
  icon: string;
  category: 'learning' | 'solution';
}

export const PREFERENCE_INFO: PreferenceInfo[] = [
  {
    key: 'showHint',
    label: 'Show Hint Button',
    description: 'Display hint option before submitting answer',
    icon: '💡',
    category: 'learning',
  },
  {
    key: 'showDetailedSolution',
    label: 'Show Detailed Solution',
    description: 'Display complete solution after answering',
    icon: '📖',
    category: 'solution',
  },
  {
    key: 'showStrategy',
    label: 'Show Solving Strategy',
    description: 'Display strategic approach and tips',
    icon: '🎯',
    category: 'solution',
  },
  {
    key: 'showCommonMistakes',
    label: 'Show Common Mistakes',
    description: 'Display common errors to avoid',
    icon: '⚠️',
    category: 'solution',
  },
];

/**
 * Storage key for preferences
 */
const STORAGE_KEY = 'question-ui-preferences';

/**
 * Load preferences from local storage
 */
export function loadUIPreferences(): QuestionUIPreferences {
  if (typeof window === 'undefined') return DEFAULT_UI_PREFERENCES;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle new preferences added in updates
      return {
        ...DEFAULT_UI_PREFERENCES,
        ...parsed,
        solutionContentFilters: {
          ...DEFAULT_UI_PREFERENCES.solutionContentFilters,
          ...(parsed.solutionContentFilters || {}),
        },
      };
    }
  } catch (error) {
    console.error('Error loading UI preferences:', error);
  }
  
  return DEFAULT_UI_PREFERENCES;
}

/**
 * Save preferences to local storage
 */
export function saveUIPreferences(preferences: QuestionUIPreferences): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving UI preferences:', error);
  }
}

/**
 * Reset preferences to default
 */
export function resetUIPreferences(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error resetting UI preferences:', error);
  }
}

/**
 * Get preference by category
 */
export function getPreferencesByCategory(category: 'learning' | 'solution'): PreferenceInfo[] {
  return PREFERENCE_INFO.filter(p => p.category === category);
}

