import prisma from "@/lib/prisma"
import { jsonResponse } from "@/utils/api-response"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")

    if (!username) {
      return jsonResponse(null,{ success: false, message: "Username is required", status: 400 })
    }

    // Check if username exists in database
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    // Return true if username is available (doesn't exist), false if taken
    return jsonResponse(
      { available: !existingUser },
      { success: true, message: "Ok", status: 200 }
    )

  } catch (error) {
    console.error("Error checking username:", error)
    return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 })
  }
}
