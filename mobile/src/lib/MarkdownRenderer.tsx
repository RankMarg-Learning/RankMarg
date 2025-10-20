import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Linking, Image as RNImage } from 'react-native';
import Markdown from 'react-native-markdown-display';
import MathView from 'react-native-math-view';

interface MarkdownRendererProps {
  content: string;
  style?: any;
}

/* -------------------------- fast helpers & constants -------------------------- */

const DEFAULT_IMG = { width: 190, height: 190, loc: 'center' as const };
const IMG_EXT_RE = /\.(?:jpg|jpeg|png|gif|webp|svg)(?:\?.*)?$/i;
const HTTP_IMAGE_HINT_RE = /^https?:\/\/.*\bimage\b/i;

// Parse ?w=..&h=..&loc=.. without URL()
function extractImageProps(url: string | undefined) {
  if (!url) return DEFAULT_IMG;

  const qIndex = url.indexOf('?');
  if (qIndex === -1) return DEFAULT_IMG;

  const query = url.substring(qIndex + 1);
  if (!query) return DEFAULT_IMG;

  let w = DEFAULT_IMG.width;
  let h = DEFAULT_IMG.height;
  let loc: 'left' | 'center' | 'right' | 'float-left' | 'float-right' = DEFAULT_IMG.loc;

  const pairs = query.split('&');
  for (let i = 0; i < pairs.length; i++) {
    const [k, v] = pairs[i].split('=');
    if (!v) continue;
    if (k === 'w') {
      const n = parseInt(v, 10);
      if (!Number.isNaN(n) && n > 0 && n < 4096) w = n;
    } else if (k === 'h') {
      const n = parseInt(v, 10);
      if (!Number.isNaN(n) && n > 0 && n < 4096) h = n;
    } else if (k === 'loc') {
      if (v === 'left' || v === 'center' || v === 'right' || v === 'float-left' || v === 'float-right') {
        loc = v;
      }
    }
  }
  return { width: w, height: h, loc };
}

export const handleImagePaste = (text: string | undefined) => {
  if (!text) return null;

  const isImageUrl = IMG_EXT_RE.test(text) || HTTP_IMAGE_HINT_RE.test(text);

  if (!isImageUrl) return null;

  return `![Image](${text})`;
};

/* -------------------------- Math Processing -------------------------- */

// Extract math expressions and replace with placeholders
function preprocessMath(content: string) {
  const mathExpressions: Array<{ type: 'inline' | 'block'; content: string }> = [];
  let processed = content;

  // Process display math ($$...$$)
  processed = processed.replace(/\$\$([\s\S]+?)\$\$/g, (match, math) => {
    const index = mathExpressions.length;
    mathExpressions.push({ type: 'block', content: math.trim() });
    return `___MATH_BLOCK_${index}___`;
  });

  // Process inline math ($...$)
  processed = processed.replace(/\$([^\$\n]+?)\$/g, (match, math) => {
    const index = mathExpressions.length;
    mathExpressions.push({ type: 'inline', content: math.trim() });
    return `___MATH_INLINE_${index}___`;
  });

  return { processed, mathExpressions };
}

// Component to render a single math expression
const MathRenderer: React.FC<{ content: string; inline?: boolean }> = ({ content, inline = false }) => {
  return (
    <View style={inline ? styles.mathInline : styles.mathBlock}>
      <MathView
        math={content}
        style={inline ? styles.mathInlineText : styles.mathBlockText}
      />
    </View>
  );
};

/* --------------------------------- Styles --------------------------------- */

const styles = StyleSheet.create({
  body: {
    color: '#374151',
    fontSize: 14,
    lineHeight: 22,
  },
  heading1: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 0,
    marginBottom: 8,
    lineHeight: 28,
  },
  heading2: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 0,
    marginBottom: 8,
    lineHeight: 26,
  },
  heading3: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginTop: 0,
    marginBottom: 4,
    lineHeight: 24,
  },
  paragraph: {
    color: '#374151',
    marginTop: 8,
    marginBottom: 8,
    lineHeight: 22,
  },
  strong: {
    fontWeight: 'bold',
    color: '#111827',
  },
  em: {
    fontStyle: 'italic',
    color: '#1f2937',
  },
  code_inline: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#dc2626',
  },
  code_block: {
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
    overflow: 'hidden',
  },
  fence: {
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
    overflow: 'hidden',
  },
  link: {
    color: '#2563eb',
    textDecorationLine: 'underline',
  },
  blockquote: {
    backgroundColor: '#eff6ff',
    borderLeftWidth: 2,
    borderLeftColor: '#3b82f6',
    paddingLeft: 16,
    paddingVertical: 8,
    marginVertical: 12,
    borderRadius: 4,
  },
  bullet_list: {
    marginVertical: 8,
  },
  ordered_list: {
    marginVertical: 8,
  },
  list_item: {
    color: '#374151',
    marginVertical: 4,
    lineHeight: 22,
  },
  hr: {
    backgroundColor: '#d1d5db',
    height: 1,
    marginVertical: 4,
  },
  table: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    marginVertical: 12,
  },
  thead: {
    backgroundColor: '#f9fafb',
  },
  tbody: {},
  th: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 6,
    backgroundColor: '#f3f4f6',
    fontWeight: '600',
    fontSize: 14,
  },
  tr: {
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
  },
  td: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 6,
    fontSize: 14,
  },
  image: {
    marginVertical: 12,
    height: 64,
    resizeMode: 'contain',
  },
  mathBlock: {
    marginVertical: 16,
    alignItems: 'center',
  },
  mathBlockText: {
    fontSize: 16,
    color: '#111827',
  },
  mathInline: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  mathInlineText: {
    fontSize: 14,
    color: '#374151',
  },
});

/* --------------------------------- Component -------------------------------- */

const MarkdownRenderer: React.FC<MarkdownRendererProps> = React.memo(({ content, style }) => {
  // Process content and extract math
  const { processedContent, mathExpressions } = useMemo(() => {
    let out = content;
    if (out.includes('\\n')) out = out.replace(/\\n/g, '\n');
    if (out.includes('\\\\')) out = out.replace(/\\\\/g, '\\');
    return preprocessMath(out);
  }, [content]);

  // Custom rules for rendering
  const rules = useMemo(() => ({
    image: (node: any, children: any, parent: any, styles: any) => {
      const { src, alt } = node.attributes;
      const { width, height, loc } = extractImageProps(src);
      
      const okSrc = src && (src.startsWith('/') || src.startsWith('http')) 
        ? src 
        : 'https://via.placeholder.com/190';

      const alignStyle = 
        loc === 'left' ? { alignSelf: 'flex-start' } :
        loc === 'right' ? { alignSelf: 'flex-end' } :
        { alignSelf: 'center' };

      return (
        <View key={node.key} style={[{ marginVertical: 12 }, alignStyle]}>
          <RNImage
            source={{ uri: okSrc }}
            style={{
              width: width,
              height: height,
              resizeMode: 'contain',
            }}
            alt={alt || 'Image'}
          />
        </View>
      );
    },
    link: (node: any, children: any, parent: any, styles: any) => {
      return (
        <Text
          key={node.key}
          style={styles.link}
          onPress={() => {
            if (node.attributes.href) {
              Linking.openURL(node.attributes.href);
            }
          }}
        >
          {children}
        </Text>
      );
    },
    text: (node: any, children: any, parent: any, styles: any) => {
      const text = node.content;
      
      // Check for math placeholders
      const blockMatch = text.match(/___MATH_BLOCK_(\d+)___/);
      if (blockMatch) {
        const index = parseInt(blockMatch[1], 10);
        const mathExpr = mathExpressions[index];
        return <MathRenderer key={node.key} content={mathExpr.content} inline={false} />;
      }

      const inlineMatch = text.match(/___MATH_INLINE_(\d+)___/);
      if (inlineMatch) {
        const index = parseInt(inlineMatch[1], 10);
        const mathExpr = mathExpressions[index];
        return <MathRenderer key={node.key} content={mathExpr.content} inline={true} />;
      }

      return (
        <Text key={node.key} style={styles.body}>
          {text}
        </Text>
      );
    },
  }), [mathExpressions]);

  return (
    <View style={style}>
      <Markdown
        style={styles}
        rules={rules}
      >
        {processedContent}
      </Markdown>
    </View>
  );
}, (prev, next) => prev.content === next.content);

export default MarkdownRenderer;