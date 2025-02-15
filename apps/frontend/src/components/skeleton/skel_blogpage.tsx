import { Card } from "../ui/card";
import { Skeleton } from "../ui/skeleton";


export default function SkeletonBlogPage(){
    return(
        <Card>
        <div className="p-6">
            <div className="flex items-center justify-between mb-4">
                <Skeleton className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded w-20 h-5"/>
            </div>
            <Skeleton className="text-3xl font-bold mb-4 text-gray-800 w-56 h-8"/>
            <Skeleton className="prose prose-lg max-w-none w-full h-screen"/>
        </div>
    </Card>

    )
}