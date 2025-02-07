import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    // Check if username exists in database
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    // Return true if username is available (doesn't exist), false if taken
    return NextResponse.json(!existingUser)

  } catch (error) {
    console.error("Error checking username:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
