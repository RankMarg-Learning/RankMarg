export async function GET() {
    try {
        const api = `https://rankmarg-blog.vercel.app/api/blog`;
        const response = await fetch(api, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "rankmarg",
            }
        });

        // Ensure response is always 200 by extracting JSON and setting status manually
        const data = response.ok ? await response.json() : { error: "Failed to fetch blog data" };

        return new Response(JSON.stringify(data), {
            status: 200, // Always return 200
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
                "Pragma": "no-cache",
                "Expires": "0",
            },
        });

    } catch (error) {
        console.error("[Blog]:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
