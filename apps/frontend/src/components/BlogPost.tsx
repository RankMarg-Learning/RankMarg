"use client"
import React from 'react';
import 'katex/dist/katex.min.css';
import { Card } from './ui/card';
import { Separator } from '@radix-ui/react-dropdown-menu';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import SkeletonBlogPage from './skeleton/skel_blogpage';
import MarkdownRenderer from '@/lib/MarkdownRenderer';


export default function BlogPost({slug}:{slug:string}) {
    const { data: blog, isLoading } = useQuery({
        queryKey: ["blogs", slug],
        queryFn: async () => {
            const { data } = await axios.get(`/api/blog/${slug}`);
            return data;
          },
    });

    if(isLoading) return <SkeletonBlogPage/>
    
    return (
        <Card>
            <div className="p-6 ">
                <div className="flex items-center justify-between mb-4">
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">{blog?.category}</span>
                </div>
                <h1 className="text-3xl font-bold mb-4 text-gray-800">{blog?.title}</h1>
                <Separator className='h-[1px] bg-gray-200 my-5'/>
                <div className="prose prose-lg max-w-none">
                    <MarkdownRenderer content={blog?.content}/>
                </div>
            </div>
        </Card>
    )
}

