import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";



export async function GET(req:Request) {
    try {
        const response = await prisma.attempt.updateMany({
            where: {
                userId: "0aad2b65-5334-4ab2-b6c8-1e37d97dc3f5"
            },
            data: {
                mistake: "CALCULATION"
            }
        })
        return jsonResponse(response,{status: 200,message: "Successfully updated",success: true})
        
    } catch (error) {
        console.error("Error in dummy API:", error);
        return jsonResponse(null, {status: 500,message: "Internal Server Error",success: false})
    }
}


