import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { ContributeFormProps } from "@/types";

export async function GET(req:Request) {
  const limit = 20;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10); // Default to page 1

  const skip = (page - 1) * limit;
    try {
        const questions = await prisma.question.findMany({
          select:{
            id: true,
            slug: true,
            content: true,
            difficulty: true,
            topic: true,
            subject: true,
            class: true,
            tag: true,
            accuracy: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: limit
        });
        


        const total = await prisma.question.count(); 
        const totalPages = Math.ceil(total / limit);

        return Response.json(
            {
                questionSet: questions,
                currentPage: page,
                totalPages,
                totalItems: total,
            },
            { status: 200 }
        );
        
    } catch (error) {
        console.log("[Question] :",error);
        return new Response("Internal Server Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    const body = await req.json();
    const formState: ContributeFormProps = body;
    try {
      if (
        !formState.slug ||
        !formState.questionType ||
        !formState.content ||
        !formState.difficulty ||
        !formState.subject ||
        !formState.std ||
        !formState.topicTitle 
      ) {
        return NextResponse.json({ error: "Missing required fields" });
      }
  
      const question = await prisma.question.create({
        data: {
          slug: formState.slug,
          type: formState.questionType,
          content: formState.content,
          difficulty: formState.difficulty,
          topic: formState.topicTitle,
          subject: formState.subject,
          class: formState.std,
          tag: formState.tag,
          isnumerical: formState.numericalAnswer,
          isTrueFalse: formState.isTrueFalse,
          options: {
            create: formState.options?.map((option) => ({
              content: option.content,
              isCorrect: option.isCorrect,
            })),
          },
          
          createdAt: new Date(),
        },
      });
      // console.log(question);
  
      if (!question) {
        return NextResponse.json({ error: "Failed to create question" });
      }
      return NextResponse.json({ message: "Question created successfully" });
    } catch (err) {
      console.error(err);
      return NextResponse.json({ message: err });
    }
  }