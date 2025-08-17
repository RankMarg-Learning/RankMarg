import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";


export async function GET(req: Request, {params} : { params: { id: string } }){
    const {id} = params;
    try {
        const subject = await prisma.subject.findUnique({
            where: { id }
        });
        if (!subject) return jsonResponse(null, { success: false, message: "Subject not found", status: 404 })
        return jsonResponse(subject, { success: true, message: "Ok", status: 200 })

    } catch (error) {
        return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 })
    }
}

export async function PUT(req: Request, {params} : { params: { id: string } }){
    const {id} = params;
    const body = await req.json();
    const { name, shortName } = body;
    try {
        const subject = await prisma.subject.update({
            where: { id },
            data: { name, shortName }
        });
        return jsonResponse(subject, { success: true, message: "Ok", status: 200 })

    } catch (error) {
        return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 })
    }
}

export async function DELETE(req: Request, {params} : { params: { id: string } }){
    const {id} = params;
    try {
        await prisma.subject.delete({
            where: { id }
        });
        return jsonResponse(null, { success: true, message: "Ok", status: 200 })

    } catch (error) {
        console.error("[Subject] :", error);
        if (error.code === "P2003") {
            return jsonResponse(null, { success: false, message: "Cannot delete subject with existing topics", status: 400 })
    }
        return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 })
    }
}