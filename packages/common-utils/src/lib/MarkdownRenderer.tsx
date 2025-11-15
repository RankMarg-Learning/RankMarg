import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';
import Image from 'next/image';
import Link from 'next/link';

interface MarkdownRendererProps {
  content: string;
  className?: string;
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

  // fast split, no decode
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

export const handleImagePaste = (event: React.ClipboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
  const data = event.clipboardData;
  const text = data?.getData('text')?.trim();
  if (!text) return false;

  const isImageUrl = IMG_EXT_RE.test(text) || HTTP_IMAGE_HINT_RE.test(text);

  if (!isImageUrl) return false;

  event.preventDefault();

  const target = event.currentTarget;
  const { selectionStart: start = 0, selectionEnd: end = 0, value: currentValue } = target as any;
  const imageMarkdown = `![Image](${text})`;

  // Single DOM write
  const newValue = currentValue.slice(0, start) + imageMarkdown + currentValue.slice(end);
  (target as any).value = newValue;

  // Fire input event so frameworks pick it up
  target.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));

  const newCursorPos = start + imageMarkdown.length;
  // In microtask to avoid layout thrash
  queueMicrotask(() => {
    (target as any).focus?.();
    (target as any).setSelectionRange?.(newCursorPos, newCursorPos);
  });

  return true;
};

/* ------------------------------ memoized config ------------------------------ */

const REMARK_PLUGINS = [remarkGfm, remarkMath] as const;
const REHYPE_PLUGINS = [rehypeRaw, rehypeKatex] as const;

const imageFloatClass = (loc: string) =>
  loc === 'float-left'
    ? 'float-left mr-3 mb-2'
    : loc === 'float-right'
    ? 'float-right ml-3 mb-2'
    : '';

const imageAlignClass = (loc: string) =>
  loc === 'left' ? 'justify-start' : loc === 'right' ? 'justify-end' : 'justify-center';

/* --------------------------------- Component -------------------------------- */

const MarkdownRenderer: React.FC<MarkdownRendererProps> = React.memo(({ content, className }) => {
  // Avoid double replace if not needed
  const processedContent = useMemo(() => {
    let out = content;
    if (out.includes('\\n')) out = out.replace(/\\n/g, '\n');
    if (out.includes('\\\\')) out = out.replace(/\\\\/g, '\\');
    return out;
  }, [content]);

  // Stable component overrides
  const components = useMemo(() => {
    return {
      img: ({ src, alt, title }: { src?: string; alt?: string; title?: string }) => {
        const { width, height, loc } = extractImageProps(src);
        const okSrc = src && (src.startsWith('/') || src.startsWith('http')) ? src : '/image_notfound.png';

        if (loc === 'float-left' || loc === 'float-right') {
          return (
            <Image
              src={okSrc}
              alt={alt || 'Image'}
              title={title || ''}
              width={width}
              height={height}
              style={{ width: 'auto', height: 'auto' }}
              className={`w-auto h-16 object-contain ${imageFloatClass(loc)}`}
              loading="lazy"
            />
          );
        }

        return (
          <div className={`my-3 flex ${imageAlignClass(loc)}`}>
            <Image
              src={okSrc}
              alt={alt || 'Image'}
              title={title || ''}
              width={width}
              height={height}
              style={{ width: 'auto', height: 'auto' }}
              className="w-auto h-16 object-contain"
              loading="lazy"
            />
          </div>
        );
      },

      a: ({ href, children }: any) => (
        <Link
          href={href || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 transition-colors duration-300 hover:text-primary-500 underline hover:no-underline tracking-wide"
          aria-label={href ? `External link to ${href}` : 'External link'}
        >
          {children}
        </Link>
      ),

        // table: ({ children }: any) => (
          // <div className="overflow-x-auto my-1">
            // <table className=" border-collapse border border-gray-200 rounded-sm">{children}</table>
          // </div>
        // ),
      // thead: ({ children }: any) => <thead className="bg-gray-50">{children}</thead>,
      tbody: ({ children }: any) => <tbody className="divide-y divide-gray-100">{children}</tbody>,
      tr: ({ children }: any) => <tr className="even:bg-gray-50 hover:bg-gray-100/50">{children}</tr>,
      th: ({ children }: any) => (
        <th className="border border-gray-200 px-1.5 py-1.5 bg-gray-100 font-semibold text-left text-sm">{children}</th>
      ),
      td: ({ children }: any) => <td className="border border-gray-200 px-1.5 py-1.5 text-sm">{children}</td>,

      code: ({ className: cn, children, ...props }: any) => {
        const match = /language-(\w+)/.exec(cn || '');
        const language = match ? match[1] : '';
        const isInline = !cn?.includes('language-');

        if (isInline) {
          return (
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[12px] font-mono text-red-600 tracking-wide" {...props}>
              {children}
            </code>
          );
        }

        return (
          <div className="my-4">
            {language && (
              <div className="bg-gray-800 text-white px-3 py-1.5 rounded-t text-[11px] font-mono">{language.toUpperCase()}</div>
            )}
            <pre className={`bg-gray-900 text-gray-100 p-4 overflow-x-auto leading-relaxed ${language ? 'rounded-b' : 'rounded'}`}>
              <code className={`text-xs font-mono tracking-wide ${cn || ''}`} {...props}>
                {children}
              </code>
            </pre>
          </div>
        );
      },

      h1: ({ children }: any) => (
        <h1 className="text-xl font-bold text-gray-900  leading-relaxed tracking-wide">{children}</h1>
      ),
      h2: ({ children }: any) => (
        <h2 className="text-lg font-semibold text-gray-800  leading-relaxed tracking-wide">{children}</h2>
      ),
      h3: ({ children }: any) => (
        <h3 className="text-base font-medium text-gray-700  leading-relaxed tracking-wide">{children}</h3>
      ),

      ul: ({ children }: any) => <ul className="list-disc  leading-relaxed">{children}</ul>,
      ol: ({ children }: any) => <ol className="list-decimal  leading-relaxed">{children}</ol>,
      li: ({ children }: any) => <li className="text-gray-700">{children}</li>,

      p: ({ children }: any) => <p className="text-gray-700 leading-relaxed tracking-wide">{children}</p>,

      strong: ({ children }: any) => <strong className="font-bold text-gray-900 tracking-wide">{children}</strong>,
      em: ({ children }: any) => <em className="italic text-gray-800 tracking-wide">{children}</em>,

      blockquote: ({ children }: any) => (
        <blockquote className="border-l-2 border-primary-500 pl-4 py-2 my-3 bg-primary-50 rounded-r leading-relaxed">
          <div className="flex items-start">
            <div className="text-sm tracking-wide">{children}</div>
          </div>
        </blockquote>
      ),

      hr: () => <hr className="my-1 border-gray-300" />,

      // Common HTML structural tags often emitted by LLMs
      details: ({ children }: any) => <details className="my-2 border border-gray-200 rounded p-3">{children}</details>,
      summary: ({ children }: any) => <summary className="cursor-pointer font-medium text-gray-800">{children}</summary>,
    } as const;
  }, []);

  return (
    <div
      className={[
        'prose max-w-none',
        'prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-pre:my-2 prose-blockquote:my-3',
        'prose-headings:mt-0 prose-h1:mb-2 prose-h2:mb-2 prose-h3:mb-1',
        'prose-code:my-0 prose-table:my-3 prose-img:my-3',
        className ?? '',
      ].join(' ')}
    >
      <ReactMarkdown
        remarkPlugins={REMARK_PLUGINS as any}
        rehypePlugins={REHYPE_PLUGINS as any}
        skipHtml={false}
        components={components as any}
      >
        {processedContent}
      </ReactMarkdown>
      <style jsx global>{`
        /* Ensure block KaTeX (display math) is centered and separated */
        .prose :where(.katex-display) {
          margin-top: 1rem;
          margin-bottom: 1rem;
          text-align: center !important;
        }
        .prose :where(.katex-display > .katex) {
          display: inline-block;
        }
        /* Keep inline math inline */
        .prose :where(.katex) {
          white-space: normal;
        }
      `}</style>
    </div>
  );
}, (prev, next) => prev.content === next.content && prev.className === next.className);

export default MarkdownRenderer;
