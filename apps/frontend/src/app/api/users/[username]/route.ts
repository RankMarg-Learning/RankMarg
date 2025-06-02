import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";

export async function GET(req: Request, { params }: { params: { username: string } }) {
    const { username } = params;

    try {
        const user = await prisma.user.findUnique({
            where: {
                username
            },
            include:{
                attempts:true
            }
            
        });

        if (!user) {
            return jsonResponse(null, { success: false, message: "User not found", status: 404 });
        }

        return jsonResponse(user, { success: true, message: "Ok", status: 200 });

    }
    catch (error) {
        console.log("[User-Dynamic] :", error);
        return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 });
    }
}


