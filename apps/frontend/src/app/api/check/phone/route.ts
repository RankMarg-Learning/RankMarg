import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";
import { getAuthSession } from "@/utils/session";

export async function POST(req: Request) { 
    try {
        const body = await req.json();
        const { phone } = body;
        
        if (!phone) {
            return jsonResponse(null, { success: false, message: "Phone number is required", status: 400 });
        }

        const session = await getAuthSession();
        if (!session) {
            return jsonResponse(null, { success: false, message: "Unauthorized", status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { phone }
        });

        if (user) {
            return jsonResponse(null, { success: false, message: "Phone number is already registered", status: 409 });
        }

        return jsonResponse(null, { success: true, message: "Phone number is available", status: 200 });
        
    } catch (error) {
        console.error("Error in phone check route:", error);
        return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 });
    }
}