import { v2 as cloudinary } from 'cloudinary'
import { jsonResponse } from '@/utils/api-response';
import { getAuthSession } from '@/utils/session';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: Request) {
  try {
    const session = await getAuthSession()
    if (!session) {
      return jsonResponse(null, { success: false, message: "Unauthorized", status: 401 })
    }

    const body = await req.json()
    const { image } = body

    if (!image) {
      return jsonResponse(null, { success: false, message: "Image is required", status: 400 })
    }

    const result = await cloudinary.uploader.upload(image, {
      folder: "user-avatars", 
    })
    //result.secure_url
    return jsonResponse(result.secure_url, { success: true, message: "Image uploaded successfully", status: 200 })

  } catch (error) {
    console.error("[UPLOAD_ERROR]", error)
    return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 })
  }
}
