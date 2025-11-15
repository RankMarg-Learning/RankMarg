"use client"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@repo/common-ui"
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Loading from "./Loading";
import { Card } from "@repo/common-ui";

const BlogHome = () => {
    const { data: posts, isLoading } = useQuery({
        queryKey: ["blogs"],
        queryFn: async () => {
            const { data } = await axios.get(`/api/blog`);
            return data;
          },
    });
    if(isLoading) return <Loading/>
  return (
    <div className="container mx-auto px-4 py-8 h-screen">
    <h1 className="text-2xl font-bold mb-8">Latest Post</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {posts?.map((post,idx) => (
        <Card key={idx} className="group p-3 rounded-sm shadow-none">
          <Link href={`/post/${post.slug}`} className="space-y-4">
            <div className="aspect-[16/9] overflow-hidden rounded-lg">
              <Image
                src={post?.thumbnail ? post?.thumbnail :"/image_notfound.png"}
                alt={post.title}
                width={600}
                height={338}
                priority
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="space-y-2">
              <Badge variant="secondary" className="text-xs font-medium text-yellow-600 bg-yellow-50">
                {post.category}
              </Badge>
              <h2 className="text-xl font-semibold leading-snug tracking-tight">{post?.title}</h2>
              <div className="flex items-center gap-2">
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  
                  <time dateTime="22-05-2025">{new Date(post?.createdAt).toDateString().split("T")[0]}</time>
                </div>
              </div>
            </div>
          </Link>
        </Card>
      ))}
    </div>
  </div>
  )
}

export default BlogHome