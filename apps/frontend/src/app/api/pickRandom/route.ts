import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  const body = await req.json();
  const { topic, difficulty,subject } = body;


  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const filter: Prisma.QuestionWhereInput = {
      attempts: {
        none: {
          userId: session.user.id,
          isCorrect: false,
        },
      },
    };

    if (topic) filter.topic = topic;
    if (difficulty) filter.difficulty = difficulty;

    let questions = await prisma.question.findMany({
      where: filter,
    });

    if (questions.length === 0) {
      console.log('No unattempted questions found, fetching attempted ones...');
      const fallbackFilter: Prisma.QuestionWhereInput = {
        attempts: {
          some: {
            userId: session.user.id,
          },
        },
      };

      if (topic) fallbackFilter.topic = topic;
      if (difficulty) fallbackFilter.difficulty = difficulty;
      if (subject) fallbackFilter.subject = subject;

      questions = await prisma.question.findMany({
        where: fallbackFilter,
      });
    }

    if (questions.length === 0) {
      return new Response("No questions found", { status: 404 });
    }

    const randomIndex = Math.floor(Math.random() * questions.length);
    const randomQuestion = questions[randomIndex];

    return new Response(JSON.stringify(randomQuestion), { status: 200 });

  } catch (error) {
    console.log("[Pick Random] Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
