import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";
import { Stream } from "@prisma/client";


export async function GET(req: Request) {
    const {  searchParams} = new URL(req.url);
    const stream = searchParams.get('stream');
    try {
        if(stream && stream !== "undefined") {
            const subjects = await prisma.subject.findMany({
                where: {
                    stream: stream as Stream 
                },
            });
            return jsonResponse(subjects, { success: true, message: "Ok", status: 200 })
        }
        
        const subjects = await prisma.subject.findMany()
        return jsonResponse(subjects, { success: true, message: "Ok", status: 200 })

    } catch (error) {
        console.error("[Subject] :", error);
        return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 })
    }
}

export async function POST(req: Request) {
    const body = await req.json();
    const { name, stream, shortName } = body;
    try {
         await prisma.subject.create({
            data: {
              name,
              stream,
              shortName,
            },
          });
          return jsonResponse(null, { success: true, message: "Ok", status: 200 })
    } catch (error) {
        return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 })
        
    }
}