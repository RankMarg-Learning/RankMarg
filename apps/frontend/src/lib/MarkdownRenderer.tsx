import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; // For math equation rendering
import Image from 'next/image';     // For Next.js optimized images

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}  // Use remark-math for math equation support
      rehypePlugins={[rehypeKatex]} // Use rehype-katex for math rendering
        className="overflow-x-auto max-w-full text-sm  md:text-base " // Tailwind for responsive font sizing
      components={{
        img: ({ src, alt, title }) => (
          <Image
            src={src || '/fallback.png'} // Provide fallback if src is empty
            alt={alt || 'Image'}         // Default alt text for better accessibility
            title={title || ''}          // Title (optional)
            width={600}                  // Default width
            height={400}                 // Default height
            className="max-w-full h-auto object-contain" // Fully responsive images
            priority={true}              // Load image with higher priority
          />
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto max-w-full"> {/* Enable horizontal scrolling for LaTeX tables */}
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
          <tr className="even:bg-gray-50">{children}</tr> // Add zebra striping for rows
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
