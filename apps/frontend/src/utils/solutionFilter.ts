/**
 * Solution Filter Utility
 * Handles parsing and filtering of solution content based on special sections
 */

export type SolutionSectionType = 
  | 'shortcut-trick'
  | 'did-you-know'
  | 'exploratory'
  | 'if-then-scenario'
  | 'key-insight'
  | 'pro-tip'
  | 'quick-recall';

export interface SolutionSection {
  type: 'main' | SolutionSectionType;
  content: string;
  title?: string;
}

export interface SolutionFilterSettings {
  'shortcut-trick': boolean;
  'did-you-know': boolean;
  'exploratory': boolean;
  'if-then-scenario': boolean;
  'key-insight': boolean;
  'pro-tip': boolean;
  'quick-recall': boolean;
}

// Default settings - all optional sections enabled
export const DEFAULT_FILTER_SETTINGS: SolutionFilterSettings = {
  'shortcut-trick': true,
  'did-you-know': true,
  'exploratory': true,
  'if-then-scenario': true,
  'key-insight': true,
  'pro-tip': true,
  'quick-recall': true,
};

// Patterns to identify special sections
const SECTION_PATTERNS: Record<SolutionSectionType, RegExp> = {
  'shortcut-trick': /\*\*(?:shortcut|trick|shortcut\/trick|tricks?)[:：]\*\*/i,
  'did-you-know': /\*\*(?:did you know|fun fact)[:：]\*\*/i,
  'exploratory': /\*\*exploratory[:：]\*\*/i,
  'if-then-scenario': /\*\*if-then scenario[:：]\*\*/i,
  'key-insight': /\*\*key insight[:：]\*\*/i,
  'pro-tip': /\*\*pro-?tip[:：]\*\*/i,
  'quick-recall': /\*\*quick recall[:：]\*\*/i,
};

/**
 * Parse solution content into sections
 */
export function parseSolutionSections(content: string): SolutionSection[] {
  if (!content) return [];

  const sections: SolutionSection[] = [];
  const lines = content.split('\n');
  
  let currentSection: SolutionSection = {
    type: 'main',
    content: '',
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let foundSection = false;

    // Check if this line starts a special section
    for (const [sectionType, pattern] of Object.entries(SECTION_PATTERNS)) {
      if (pattern.test(line)) {
        // Save the current section if it has content
        if (currentSection.content.trim()) {
          sections.push(currentSection);
        }

        // Start a new special section
        currentSection = {
          type: sectionType as SolutionSectionType,
          content: line + '\n',
          title: line.replace(/\*\*/g, '').trim(),
        };
        foundSection = true;
        break;
      }
    }

    if (!foundSection) {
      // Check if we're starting a new section (by detecting a new bold heading that's not a special section)
      // This helps separate main content from special sections
      if (line.startsWith('**') && line.endsWith('**') && currentSection.type !== 'main') {
        // This might be the start of a new section, check if it's a main section heading
        const isMainHeading = /\*\*(?:given data|relevant relation|calculation|solution|steps?|answer|final answer)[:：]?\*\*/i.test(line);
        
        if (isMainHeading) {
          // Save current special section
          if (currentSection.content.trim()) {
            sections.push(currentSection);
          }
          // Start new main section
          currentSection = {
            type: 'main',
            content: line + '\n',
          };
        } else {
          currentSection.content += line + '\n';
        }
      } else {
        currentSection.content += line + '\n';
      }
    }
  }

  // Add the last section
  if (currentSection.content.trim()) {
    sections.push(currentSection);
  }

  // If we only have one section and it's 'main', return it as-is
  if (sections.length === 1 && sections[0].type === 'main') {
    return sections;
  }

  return sections;
}

/**
 * Filter solution content based on user settings
 */
export function filterSolutionContent(
  content: string,
  settings: SolutionFilterSettings
): string {
  const sections = parseSolutionSections(content);
  
  // Filter sections based on settings
  const filteredSections = sections.filter(section => {
    if (section.type === 'main') return true;
    return settings[section.type] !== false;
  });

  // Reconstruct content
  return filteredSections.map(s => s.content).join('\n').trim();
}

/**
 * Get section display info
 */
export function getSectionInfo(type: SolutionSectionType): {
  label: string;
  description: string;
  icon: string;
} {
  const info: Record<SolutionSectionType, { label: string; description: string; icon: string }> = {
    'shortcut-trick': {
      label: 'Shortcuts & Tricks',
      description: 'Quick methods and mental math tricks',
      icon: '⚡',
    },
    'did-you-know': {
      label: 'Did You Know',
      description: 'Interesting facts and additional context',
      icon: '💡',
    },
    'exploratory': {
      label: 'Exploratory',
      description: 'Deep dive and alternative approaches',
      icon: '🔍',
    },
    'if-then-scenario': {
      label: 'If-Then Scenarios',
      description: 'What-if scenarios and variations',
      icon: '🔄',
    },
    'key-insight': {
      label: 'Key Insights',
      description: 'Important takeaways and patterns',
      icon: '🎯',
    },
    'pro-tip': {
      label: 'Pro Tips',
      description: 'Expert tips and best practices',
      icon: '⭐',
    },
    'quick-recall': {
      label: 'Quick Recall',
      description: 'Key formulas and concepts for quick reference',
      icon: '🧠',
    },
  };

  return info[type];
}

/**
 * Check if solution has any special sections
 */
export function hasSpecialSections(content: string): boolean {
  if (!content) return false;
  
  for (const pattern of Object.values(SECTION_PATTERNS)) {
    if (pattern.test(content)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Get all section types present in the content
 */
export function getAvailableSections(content: string): SolutionSectionType[] {
  if (!content) return [];
  
  const availableSections: SolutionSectionType[] = [];
  
  for (const [sectionType, pattern] of Object.entries(SECTION_PATTERNS)) {
    if (pattern.test(content)) {
      availableSections.push(sectionType as SolutionSectionType);
    }
  }
  
  return availableSections;
}

/**
 * Storage key for user preferences
 */
const STORAGE_KEY = 'solution-filter-settings';

/**
 * Load filter settings from local storage
 */
export function loadFilterSettings(): SolutionFilterSettings {
  if (typeof window === 'undefined') return DEFAULT_FILTER_SETTINGS;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_FILTER_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.error('Error loading filter settings:', error);
  }
  
  return DEFAULT_FILTER_SETTINGS;
}

/**
 * Save filter settings to local storage
 */
export function saveFilterSettings(settings: SolutionFilterSettings): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving filter settings:', error);
  }
}

