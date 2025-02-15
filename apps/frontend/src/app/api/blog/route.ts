export async function GET() {
    try {
        const api = 'https://rankmarg-blog.vercel.app/api/blog';
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

        
    } catch (error) {
        console.error("[Blog]:", error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}