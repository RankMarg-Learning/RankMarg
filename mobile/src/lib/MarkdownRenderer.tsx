import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
import Katex from 'react-native-katex';

interface MarkdownRendererProps {
  content: string;
  style?: any;
}

/* ------------------------------- KaTeX styling ------------------------------ */

const styles = StyleSheet.create({
  blockMathContainer: {
    marginVertical: 8,
  },
});

const katexInlineStyle = `
html, body { margin: 0; padding: 0; background: transparent; }
.katex-display { margin: 0; }
.katex { font-size: 18px; }
`;



/* --------------------------- Helpers: LaTeX -> MD --------------------------- */

function convertLatexToMarkdown(input: string) {
  let out = input;
  out = out.replace(/\\section\*\{([^}]+)\}/g, '## $1');
  out = out.replace(/\\section\{([^}]+)\}/g, '## $1');
  out = out.replace(/\\textbf\{([^}]+)\}/g, '**$1**');
  out = out.replace(/\\emph\{([^}]+)\}/g, '*$1*');
  out = out.replace(/\\textit\{([^}]+)\}/g, '*$1*');
  // itemize
  out = out.replace(/\\begin\{itemize\}/g, '');
  out = out.replace(/\\end\{itemize\}/g, '');
  out = out.replace(/(^|\n)\s*\\item\s+/g, '$1- ');
  // enumerate
  out = out.replace(/\\begin\{enumerate\}/g, '');
  out = out.replace(/\\end\{enumerate\}/g, '');
  out = out.replace(/(^|\n)\s*\\item\s+/g, '$11. ');
  // spacing
  out = out.replace(/\\vspace\{[^}]+\}/g, '\n\n');
  out = out.replace(/\\\\(?:\[[^\]]*\])?/g, '\n');
  // text + misc
  out = out.replace(/\\text\{([^}]+)\}/g, '$1');
  out = out.replace(/\\quad/g, '    ');
  // clean extra blank lines
  out = out.replace(/\n\s*\n\s*\n/g, '\n\n');
  return out;
}

/* ------------------------------- Tokenization ------------------------------- */

type Part =
  | { type: 'text'; content: string; key: string }
  | { type: 'math-inline'; content: string; key: string }
  | { type: 'math-display'; content: string; key: string };

// Extract display math first: $$...$$ or \[ ... \]
const DISPLAY_MATH_RE = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\])/g;
// Extract inline math inside text: $...$ or \( ... \)
const INLINE_MATH_RE = /(\$[^$\n]+\$|\\\([^\)]+\\\))/g;

function stripDelimiters(s: string): string {
  if (s.startsWith('$$') && s.endsWith('$$')) return s.slice(2, -2);
  if (s.startsWith('[') && s.endsWith(']')) return s; // not expected
  if (s.startsWith('\\[') && s.endsWith('\\]')) return s.slice(2, -2);
  if (s.startsWith('$') && s.endsWith('$')) return s.slice(1, -1);
  if (s.startsWith('\\(') && s.endsWith('\\)')) return s.slice(2, -2);
  return s;
}

function tokenize(content: string): Part[] {
  const parts: Part[] = [];
  let lastIndex = 0;
  const displayMatches = content.matchAll(DISPLAY_MATH_RE);

  for (const m of displayMatches) {
    const match = m[0];
    const index = m.index ?? 0;
    if (index > lastIndex) {
      const textChunk = content.slice(lastIndex, index);
      // further split text chunk into inline math
      parts.push(...tokenizeInline(textChunk, parts.length));
    }
    parts.push({ type: 'math-display', content: stripDelimiters(match).trim(), key: `mdis-${parts.length}` });
    lastIndex = index + match.length;
  }

  if (lastIndex < content.length) {
    parts.push(...tokenizeInline(content.slice(lastIndex), parts.length));
  }

  return parts;
}

function tokenizeInline(text: string, seed: number): Part[] {
  const out: Part[] = [];
  let last = 0;
  const it = text.matchAll(INLINE_MATH_RE);
  for (const m of it) {
    const match = m[0];
    const idx = m.index ?? 0;
    if (idx > last) {
      out.push({ type: 'text', content: text.slice(last, idx), key: `t-${seed}-${out.length}` });
    }
    out.push({ type: 'math-inline', content: stripDelimiters(match).trim(), key: `mi-${seed}-${out.length}` });
    last = idx + match.length;
  }
  if (last < text.length) {
    out.push({ type: 'text', content: text.slice(last), key: `t-${seed}-${out.length}` });
  }
  return out;
}

/* --------------------------------- Component -------------------------------- */

const MarkdownRenderer: React.FC<MarkdownRendererProps> = React.memo(({ content, style }) => {
  const processed = useMemo(() => {
    let out = content ?? '';
    // Normalize escaped newlines/backslashes that may come from servers
    if (out.includes('\\n')) out = out.replace(/\\n/g, '\n');
    if (out.includes('\\\\')) out = out.replace(/\\\\/g, '\\');
    return out;
  }, [content]);

  const parts = useMemo(() => tokenize(processed), [processed]);

  return (
    <View style={style}>
      {parts.map((part) => {
        if (part.type === 'math-display') {
          return (
            <View key={part.key} style={styles.blockMathContainer}>
              <Katex
                expression={part.content}
                displayMode={true}
                throwOnError={false}
                inlineStyle={katexInlineStyle}
              />
            </View>
          );
        }

        if (part.type === 'math-inline') {
          return (
            <Katex
              key={part.key}
              expression={part.content}
              displayMode={false}
              throwOnError={false}
              inlineStyle={katexInlineStyle}
            />
          );
        }

        const md = convertLatexToMarkdown(part.content);
        return (
          <Markdown key={part.key} style={style}>
            {md}
          </Markdown>
        );
      })}
    </View>
  );
}, (prev, next) => prev.content === next.content && prev.style === next.style);

export default MarkdownRenderer;