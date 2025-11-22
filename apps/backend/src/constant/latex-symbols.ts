/**
 * LaTeX to Unicode Symbol Mappings
 * Used for transforming difficult LaTeX symbols to Unicode format
 */

export interface LatexSymbolMapping {
  latex: string[];
  unicode: string;
  description: string;
}

export const LATEX_SYMBOL_MAPPINGS: LatexSymbolMapping[] = [
  {
    latex: ['\\neq', '\\not='],
    unicode: '≠',
    description: 'Not equal to'
  },
  {
    latex: ['\\not\\approx'],
    unicode: '≉',
    description: 'Not approximately equal to'
  },
  {
    latex: ['\\not\\sim', '\\nsim'],
    unicode: '≁',
    description: 'Not similar to'
  },
  {
    latex: ['\\not\\equiv'],
    unicode: '≢',
    description: 'Not identical to'
  },
  {
    latex: ['\\notin'],
    unicode: '∉',
    description: 'Not an element of'
  },
  {
    latex: ['\\nleq'],
    unicode: '≰',
    description: 'Not less than or equal to'
  },
  {
    latex: ['\\ngeq'],
    unicode: '≱',
    description: 'Not greater than or equal to'
  },
  {
    latex: ['\\not<'],
    unicode: '≮',
    description: 'Not less than'
  },
  {
    latex: ['\\not>'],
    unicode: '≯',
    description: 'Not greater than'
  },
  {
    latex: ['\\not\\subset'],
    unicode: '⊄',
    description: 'Not a subset of'
  },
  {
    latex: ['\\not\\supset'],
    unicode: '⊅',
    description: 'Not a superset of'
  },
  {
    latex: ['\\nsubseteq'],
    unicode: '⊈',
    description: 'Not a subset of or equal to'
  },
  {
    latex: ['\\nsupseteq'],
    unicode: '⊉',
    description: 'Not a superset of or equal to'
  },
  {
    latex: ['\\nparallel'],
    unicode: '∦',
    description: 'Not parallel to'
  },
  {
    latex: ['\\not\\perp'],
    unicode: '⟂̸',
    description: 'Not perpendicular to'
  },
  {
    latex: ['\\nmid'],
    unicode: '∤',
    description: 'Does not divide'
  },
  {
    latex: ['\\not\\propto'],
    unicode: '∷̸',
    description: 'Not proportional to'
  },
  {
    latex: ['\\not\\rightarrow'],
    unicode: '↛',
    description: 'Not right arrow'
  },
  {
    latex: ['\\not\\Rightarrow'],
    unicode: '⇏',
    description: 'Not implies'
  },
  {
    latex: ['\\not\\leftrightarrow'],
    unicode: '↮',
    description: 'Not left-right arrow'
  }
];

/**
 * Create a fast lookup map for LaTeX to Unicode conversion
 * Key: LaTeX code (escaped for regex), Value: Unicode symbol
 */
export function createLatexToUnicodeMap(): Map<string, string> {
  const map = new Map<string, string>();
  
  for (const mapping of LATEX_SYMBOL_MAPPINGS) {
    for (const latex of mapping.latex) {
      map.set(latex, mapping.unicode);
    }
  }
  
  return map;
}

/**
 * Create regex pattern for fast matching of all LaTeX symbols
 * Sorted by length (longest first) to match complex patterns before simple ones
 */
export function createLatexMatchPattern(): RegExp {
  const allLatexCodes = LATEX_SYMBOL_MAPPINGS.flatMap(m => m.latex);
  
  // Sort by length (longest first) to match complex patterns first
  const sortedCodes = allLatexCodes.sort((a, b) => b.length - a.length);
  
  // Escape special regex characters and create pattern
  const escapedCodes = sortedCodes.map(code => 
    code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  
  return new RegExp(escapedCodes.join('|'), 'g');
}

/**
 * Get all supported LaTeX symbols and their Unicode equivalents
 * Useful for documentation or debugging
 */
export function getSupportedLatexSymbols(): Array<{
  latex: string[];
  unicode: string;
  description: string;
}> {
  return LATEX_SYMBOL_MAPPINGS.map(mapping => ({
    latex: [...mapping.latex],
    unicode: mapping.unicode,
    description: mapping.description,
  }));
}

/**
 * Check if a text contains any LaTeX symbols that should be replaced
 * @param text - Text to check
 * @returns Array of found LaTeX codes
 */
export function findLatexSymbols(text: string): Array<{
  latex: string;
  unicode: string;
  position: number;
}> {
  const found: Array<{ latex: string; unicode: string; position: number }> = [];
  const map = createLatexToUnicodeMap();
  const pattern = createLatexMatchPattern();
  
  let match: RegExpExecArray | null;
  pattern.lastIndex = 0;
  
  while ((match = pattern.exec(text)) !== null) {
    const latexCode = match[0];
    const unicode = map.get(latexCode);
    
    if (unicode) {
      found.push({
        latex: latexCode,
        unicode: unicode,
        position: match.index,
      });
    }
  }
  
  return found;
}

