import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { ContributeFormProps } from "@/types";

export async function GET(req: Request) {
  const limit = 20;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const subject = searchParams.get("subject");
  const difficulty = searchParams.get("difficulty");
  const tags = searchParams.get("tags");
  const search = searchParams.get("search");

  const skip = (page - 1) * limit;

  try {
    const whereClause: any = {};
    if (subject) whereClause.subject = subject;
    if (difficulty) whereClause.difficulty = difficulty;
    if (tags) whereClause.tag = tags;
    if (search) {
      whereClause.OR = [
        { content: { contains: search, mode: "insensitive" } },
        { topic: { contains: search, mode: "insensitive" } },
      ];
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where: whereClause,
        select: {
          id: true,
          slug: true,
          title: true,
          content: true,
          difficulty: true,
          topic: true,
          subject: true,
          class: true,
          tag: true,
          accuracy: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.question.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        questionSet: questions,
        currentPage: page,
        totalPages,
        totalItems: total,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Question]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
    const body = await req.json();
    const formState: ContributeFormProps = body;
    try {
      if (
        !formState.stream ||
        !formState.title ||
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
          title: formState.title,
          type: formState.questionType,
          content: formState.content,
          difficulty: formState.difficulty,
          topic: formState.topicTitle,
          subject: formState.subject,
          hint: formState.hint,
          stream: formState.stream,
          class: formState.std,
          tag: formState.tag,
          questionTime: formState.questionTime,
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