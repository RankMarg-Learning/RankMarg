//! NOT USING THIS FILE 

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { jsonResponse } from "@/utils/api-response";
import { getAuthSession } from "@/utils/session";

export async function POST(req: Request) {
  const body = await req.json();
  const {  difficulty } = body;


  const session = await await getAuthSession()

  if (!session || !session.user?.id) {
    return jsonResponse(null, { success: false, message: "Unauthorized", status: 401 });
  }

  try {
    const filter: Prisma.QuestionWhereInput = {
      attempts: {
        none: {
          userId: session.user.id,
          status: "CORRECT",
        },
      },
    };

    if (difficulty) filter.difficulty = difficulty;

    let questions = await prisma.question.findMany({
      where: filter,
    });

    if (questions.length === 0) {
      const fallbackFilter: Prisma.QuestionWhereInput = {
        attempts: {
          some: {
            userId: session.user.id,
          },
        },
      };

      if (difficulty) fallbackFilter.difficulty = difficulty;

      questions = await prisma.question.findMany({
        where: fallbackFilter,
      });
    }

    if (questions.length === 0) {
      return jsonResponse(null, { success: false, message: "No questions available", status: 404 });
    }

    const randomIndex = Math.floor(Math.random() * questions.length);
    const randomQuestion = questions[randomIndex];

    return jsonResponse(randomQuestion, { success: true, message: "Ok", status: 200 });

  } catch (error) {
    console.log("[Pick Random] Error:", error);
    return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 });
  }
}
