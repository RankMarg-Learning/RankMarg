
import BlogPost from '@/components/BlogPost';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slugs: string } }): Promise<Metadata> {
    const { slugs } = params;

    const metadata = {
        title: ` ${slugs.replace("-", " ")} | RankMarg - Your Personal AI Coach for JEE & NEET `,
        description: `Read our latest blog on ${slugs.replace("-", " ")}, covering insights and expert opinions.`,
        openGraph: {
            title: `${slugs.replace("-", " ")} | RankMarg | Your Personal AI Coach for JEE & NEET `,
            description: `Explore insights on ${slugs.replace("-", " ")}`,
            url: `${process.env.NEXT_PUBLIC_WEBSITE_URL!}/post/${slugs}`,
            type: "article",
            images: [
                {
                    url: "https://cdn.rankmarg.in/assets/og-cover.png", 
                    width: 1200,
                    height: 630,
                    alt: "RankMarg – Your Personal AI Coach for JEE & NEET ",
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: `${slugs.replace("-", " ")} | RankMarg | Your Personal AI Coach for JEE & NEET `,
            description: `Explore insights on ${slugs.replace("-", " ")}`,
        },
        icons: {
            icon: "/favicon.ico",
        },
    };

    return metadata;
}

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