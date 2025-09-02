import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";


export async function GET(req: Request) {
    const {  searchParams} = new URL(req.url);
    const examCode = searchParams.get('examCode');
    try {
        if (examCode && examCode !== "undefined") {
            const examSubjects = await prisma.examSubject.findMany({
                where: { examCode },
                select: { subject: true },
            });
            const subjects = examSubjects.map(es => es.subject);
            return jsonResponse({ data: subjects }, { success: true, message: "Ok", status: 200 })
        }
        
        
        const subjects = await prisma.subject.findMany({
            orderBy: { name: 'asc' }
        })
        return jsonResponse({ data: subjects }, { success: true, message: "Ok", status: 200 })

    } catch (error) {
        console.error("[Subject] :", error);
        return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 })
    }
}

export async function POST(req: Request) {
    const body = await req.json();
    const { name, shortName } = body;
    try {
         await prisma.subject.create({
            data: {
              name,
              shortName,
            },
          });
          return jsonResponse(null, { success: true, message: "Ok", status: 200 })
    } catch (error) {
        return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 })
        
    }
}