import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";

export async function PUT(req: Request, { params }: { params: { attemptId: string } }) {
    const { attemptId } = params;
    const body = await req.json();
    try {
        await prisma.attempt.update({
            where: {
                id:attemptId
            },
            data: {
                ...body
            },
        });
        return jsonResponse(null, { success: true, message: "Ok", status: 200 });
    } catch (error) {
        console.error("[Question-Dynamic] :", error);
        return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { attemptId: string } }) {
    const { attemptId } = params;
    try {
        await prisma.attempt.delete({
            where: {
                id:attemptId
            }
        });
        return jsonResponse(null, { success: true, message: "Ok", status: 204 });
    } catch (error) {
        console.log("[Question-Dynamic] :", error);
        return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 });
    }
}