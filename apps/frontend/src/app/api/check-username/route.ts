import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const username = url.searchParams.get("username");

  if (!username) {
    return jsonResponse(null,{success:false,message:"Unauthorized",status:401});
    
  }

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if(user) {
        return jsonResponse(null, { success: false, message: "Username is already taken",status:200 });
    }
    return jsonResponse( null, { success: true, message: "Username is available",status:200 });
  } catch (error) {
    console.error(error);
    return jsonResponse(null, { success: false, message: "Internal Server Error" ,status:500});
  }
}