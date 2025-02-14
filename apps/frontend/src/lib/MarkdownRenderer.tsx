import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; // For math equation rendering
import Image from 'next/image';     // For Next.js optimized images

interface MarkdownRendererProps {
  content: string;
}

function extractDimensions(url: string) {
  const urlObj = new URL(url, window.location.origin);
  const width = urlObj.searchParams.get('w');
  const height = urlObj.searchParams.get('h');

  return {
    width: width ? parseInt(width, 10) : 190,
    height: height ? parseInt(height, 10) : 190,
  };
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="prose max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          img: ({ src, alt, title }) => {
            const { width, height } = extractDimensions(src || '');
            return (
              <Image
                src={src || '/fallback.png'}
                alt={alt || 'Image'}
                title={title || ''}
                width={width}
                height={height}
                className="w-auto h-24 object-contain"
                priority
              />
            );
          },
          table: ({ children }) => (
            <div className="overflow-x-auto max-w-full">
              <table className="table-auto w-full border-collapse border border-gray-300 text-sm sm:text-base">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-gray-300 bg-gray-100 px-2 py-1 sm:px-4 sm:py-2 text-left font-medium text-gray-700">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-300 px-2 py-1 sm:px-4 sm:py-2 text-gray-600">
              {children}
            </td>
          ),
          tr: ({ children }) => (
            <tr className="even:bg-gray-50">{children}</tr>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  ); //RDKit.js
};

export default MarkdownRenderer;
