
import BlogPost from '@/components/BlogPost';

const page = ({ params }: { params: { slugs: string } }) => {   
    const { slugs } = params; 
    return (
        <div className="grid grid-cols-12 min-h-screen">
            {/* Left Ads */}
            <div className="hidden lg:block col-span-2  p-4">
                <div className="sticky top-4 space-y-6 hidden">
                    <div className="h-60 bg-yellow-300 flex items-center justify-center text-center text-sm font-semibold">
                        Ad Space 1
                    </div>
                    <div className="h-60 bg-yellow-400 flex items-center justify-center text-center text-sm font-semibold">
                        Ad Space 2
                    </div>
                </div>
            </div>

            {/* Center Content */}
            <div className="col-span-12 lg:col-span-8 md:p-6 p-2">
                <BlogPost  slug={slugs}/>
            </div>

            {/* Right Ads */}
            <div className="hidden lg:block col-span-2  p-4">
                <div className="sticky top-4 space-y-6 hidden">
                    <div className="h-60 bg-yellow-300 flex items-center justify-center text-center text-sm font-semibold">
                        Ad Space 3
                    </div>
                    <div className="h-60 bg-yellow-400 flex items-center justify-center text-center text-sm font-semibold">
                        Ad Space 4
                    </div>
                </div>
            </div>
        </div>


    )
}

export default page