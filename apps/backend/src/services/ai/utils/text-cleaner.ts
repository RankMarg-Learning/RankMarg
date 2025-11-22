/**
 * Text Cleaning Utilities
 * Handles cleaning and sanitization of solution and mistake texts
 */

/**
 * Cleans up solution text by removing unwanted prefixes and duplicate shortcuts
 * @param solution - Solution text to clean
 * @param strategy - Strategy text to check for duplicates
 * @returns Cleaned solution text
 */
export function cleanSolutionText(solution: string, strategy?: string): string {
  // Remove "**Solution:**" prefix with optional whitespace/newlines
  let cleaned = solution.replace(/^\*\*Solution:\*\*\s*\n*\s*/i, '');
  
  // Also handle variations like "Solution:" without bold
  cleaned = cleaned.replace(/^Solution:\s*\n*\s*/i, '');
  
  // If strategy exists, check for duplicate shortcuts
  if (strategy) {
    // Extract shortcut section from solution
    const shortcutMatch = cleaned.match(/\*\*Shortcut\/Trick:\*\*\s*(.*?)(?=\n\n\*\*|\n\n-|\n\n$|$)/is);
    
    if (shortcutMatch) {
      const shortcutText = shortcutMatch[1].trim().toLowerCase();
      const strategyLower = strategy.toLowerCase();
      
      // Calculate similarity - if shortcut is very similar to strategy, remove it
      const words = shortcutText.split(/\s+/).filter(w => w.length > 3);
      const matchCount = words.filter(word => strategyLower.includes(word)).length;
      const similarity = words.length > 0 ? matchCount / words.length : 0;
      
      // If >60% of meaningful words in shortcut appear in strategy, remove shortcut section
      if (similarity > 0.6) {
        cleaned = cleaned.replace(/\*\*Shortcut\/Trick:\*\*\s*.*?(?=\n\n\*\*|\n\n-|\n\n$|$)/is, '').trim();
      }
    }
  }
  
  return cleaned.trim();
}

/**
 * Cleans up common mistake text - removes if empty or too vague
 * @param commonMistake - Common mistake text
 * @returns Cleaned common mistake text or undefined if should be removed
 */
export function cleanCommonMistake(commonMistake?: string): string | undefined {
  if (!commonMistake || commonMistake.trim() === '') {
    return undefined;
  }
  
  const trimmed = commonMistake.trim();
  
  // Remove if it's just a placeholder or too vague
  const vaguePhrases = [
    'no common mistake',
    'no specific mistake',
    'not applicable',
    'n/a',
    'none',
  ];
  
  const lowerTrimmed = trimmed.toLowerCase();
  if (vaguePhrases.some(phrase => lowerTrimmed.includes(phrase))) {
    return undefined;
  }
  
  // Count actual mistake entries (should have "Mistake:" and "Fix:")
  const mistakeCount = (trimmed.match(/Mistake:/gi) || []).length;
  
  if (mistakeCount === 0) {
    return undefined;
  }
  
  // Limit to 2 mistakes maximum
  if (mistakeCount > 2) {
    const mistakes = trimmed.split(/(?=-\s*Mistake:)/i).filter(m => m.trim());
    return mistakes.slice(0, 2).join('\n\n').trim();
  }
  
  return trimmed;
}

