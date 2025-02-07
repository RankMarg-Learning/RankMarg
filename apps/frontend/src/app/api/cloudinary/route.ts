import { v2 as cloudinary } from 'cloudinary'
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server'
import { authOptions } from '../auth/[...nextauth]/options';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json()
    const { image } = body

    if (!image) {
      return new NextResponse("Image is required", { status: 400 })
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder: "user-avatars", // Optional: organize uploads in folders
    })

    return NextResponse.json({ url: result.secure_url })
  } catch (error) {
    console.error("[UPLOAD_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
