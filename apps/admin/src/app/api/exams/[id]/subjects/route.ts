import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { id: examCode } = params;
  const body = await req.json();
  const { subjectId, weightage } = body;

  try {
    const examSubject = await prisma.examSubject.create({
      data: {
        examCode,
        subjectId,
        weightage,
      },
      include: {
        subject: true,
      },
    });

    return jsonResponse(examSubject, { 
      success: true, 
      message: "Subject added to exam successfully", 
      status: 201 
    });
  } catch (error) {
    console.error("Error adding subject to exam:", error);
    return jsonResponse(null, { 
      success: false, 
      message: "Internal Server Error", 
      status: 500 
    });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id: examCode } = params;
  const { searchParams } = new URL(req.url);
  const subjectId = searchParams.get("subjectId");

  if (!subjectId) {
    return jsonResponse(null, { 
      success: false, 
      message: "Subject ID is required", 
      status: 400 
    });
  }

  try {
    await prisma.examSubject.delete({
      where: {
        examCode_subjectId: {
          examCode,
          subjectId,
        },
      },
    });

    return jsonResponse(null, { 
      success: true, 
      message: "Subject removed from exam successfully", 
      status: 200 
    });
  } catch (error) {
    console.error("Error removing subject from exam:", error);
    return jsonResponse(null, { 
      success: false, 
      message: "Internal Server Error", 
      status: 500 
    });
  }
}
