import { NextRequest } from "next/server";

const ARTICLES_API_URL = "https://article.rankmarg.in/api/v1/articles";
const API_KEY = process.env.NEXT_PUBLIC_ARTICLE_API_KEY || "Bearer rankmarg";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Build query string from search params
    const queryParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
      queryParams.append(key, value);
    });

    const apiUrl = `${ARTICLES_API_URL}?${queryParams.toString()}`;
    
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": API_KEY,
      },
      // Add cache control for better performance
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Articles API Error]:", response.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch articles",
          status: response.status 
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("[Articles API]:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
