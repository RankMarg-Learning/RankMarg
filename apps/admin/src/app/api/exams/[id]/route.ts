import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id:examCode } = params;

  try {
    const exam = await prisma.exam.findUnique({
      where: { code:examCode },
      include: {
        examSubjects: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (!exam) {
      return jsonResponse(null, { 
        success: false, 
        message: "Exam not found", 
        status: 404 
      });
    }

    return jsonResponse(exam, { 
      success: true, 
      message: "Exam retrieved successfully", 
      status: 200 
    });
  } catch (error) {
    console.error("Error fetching exam:", error);
    return jsonResponse(null, { 
      success: false, 
      message: "Internal Server Error", 
      status: 500 
    });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await req.json();
  const {
    name,
    fullName,
    description,
    category,
    minDifficulty,
    maxDifficulty,
    totalMarks,
    duration,
    negativeMarking,
    negativeMarkingRatio,
    isActive,
    registrationStartAt,
    registrationEndAt,
    examDate,
  } = body;

  try {
    const exam = await prisma.exam.update({
      where: { code:id },
      data: {
        name,
        fullName,
        description,
        category,
        minDifficulty,
        maxDifficulty,
        totalMarks,
        duration,
        negativeMarking,
        negativeMarkingRatio,
        isActive,
        registrationStartAt: registrationStartAt ? new Date(registrationStartAt) : null,
        registrationEndAt: registrationEndAt ? new Date(registrationEndAt) : null,
        examDate: examDate ? new Date(examDate) : null,
      },
      include: {
        examSubjects: {
          include: {
            subject: true,
          },
        },
      },
    });

    return jsonResponse(exam, { 
      success: true, 
      message: "Exam updated successfully", 
      status: 200 
    });
  } catch (error) {
    console.error("Error updating exam:", error);
    return jsonResponse(null, { 
      success: false, 
      message: "Internal Server Error", 
      status: 500 
    });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    await prisma.exam.delete({
      where: { code:id },
    });

    return jsonResponse(null, { 
      success: true, 
      message: "Exam deleted successfully", 
      status: 200 
    });
  } catch (error) {
    console.error("Error deleting exam:", error);
    return jsonResponse(null, { 
      success: false, 
      message: "Internal Server Error", 
      status: 500 
    });
  }
}
