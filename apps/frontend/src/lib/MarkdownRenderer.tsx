import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from "remark-gfm";
import 'katex/dist/katex.min.css'; 
import Image from 'next/image';     
import Link from 'next/link';

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
        remarkPlugins={[remarkMath,remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
          img: ({ src, alt, title }) => {
            const { width, height } = extractDimensions(src || '');
            return (
              <Image
                src={src || '/image_notfound.png'}
                alt={alt || 'Image'}
                title={title || ''}
                width={width}
                height={height}
                style={{ width: "auto", height: "auto" }}
                className="w-auto h-24 object-contain"
                priority
              />
            );
          },
          a:({ href, children }) => (
            <Link
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-600 transition-colors duration-300 hover:text-yellow-500 underline hover:no-underline"
            >
              {children}
            </Link>
          ),
          table: ({ children }) => (
            <table className="w-full border-collapse border border-gray-500 ">{children}</table>
          ),
          th: ({ children }) => (
            <th className="border border-gray-600 px-4 py-2 bg-gray-100">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-600 px-4 py-2">{children}</td>
          ),
        
          
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  ); //RDKit.js
};

export default MarkdownRenderer;
