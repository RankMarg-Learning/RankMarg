import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const isActive = searchParams.get("isActive");

  try {
    const exams = await prisma.exam.findMany({
      where: {
        ...(category && { category }),
        ...(isActive !== null && { isActive: isActive === 'true' }),
      },
      include: {
        examSubjects: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return jsonResponse(exams, {
      success: true,
      message: "Exams retrieved successfully",
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching exams:", error);
    return jsonResponse(null, { 
      success: false, 
      message: "Internal Server Error", 
      status: 500 
    });
  }
}

export async function POST(req: Request) {
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
    const exam = await prisma.exam.create({
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
      message: "Exam created successfully", 
      status: 201 
    });
  } catch (error) {
    console.error("Error creating exam:", error);
    return jsonResponse(null, { 
      success: false, 
      message: "Internal Server Error", 
      status: 500 
    });
  }
}
