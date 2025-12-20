import { NextRequest } from "next/server";

const ARTICLES_API_URL = "https://article.rankmarg.in/api/v1/articles";
const API_KEY = process.env.NEXT_PUBLIC_ARTICLE_API_KEY || "Bearer rankmarg";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const apiUrl = `${ARTICLES_API_URL}/${slug}`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": API_KEY,
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
      cache: "no-store" as RequestCache,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Article API Error]:", response.status, errorText);
      return new Response(
        JSON.stringify({
          error: "Failed to fetch article",
          status: response.status,
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
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("[Article API]:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
