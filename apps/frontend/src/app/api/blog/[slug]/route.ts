export async function GET(
	req: Request,
	{ params }: { params: { slug: string } }
) {
	const { slug } = params
	try {
        const api = `https://rankmarg-blog.vercel.app/api/blog/${slug}`;
        const response = await fetch(api,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "rankmarg", 
                }
            }
        );
        const data = await response.json();
        return Response.json(data, { status: 200 });
	} catch (error) {}
}