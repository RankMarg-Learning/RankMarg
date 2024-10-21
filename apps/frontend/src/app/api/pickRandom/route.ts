import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { topic, difficulty } = body;


  const session = await getServerSession(authOptions);

  // Make sure the session exists
  if (!session || !session.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // Ensure valid filtering
    const filter: any = {
      attempts: {
        none: {
          userId: session.user.id,
          isCorrect: false,
        },
      },
    };

    // Add topic and difficulty to the filter only if provided
    if (topic) filter.topic = topic;
    if (difficulty) filter.difficulty = difficulty;

    // Fetch unattempted questions first with the applied filters
    let questions = await prisma.question.findMany({
      where: filter,
    });

    // If no unattempted questions are found, fetch attempted ones as a fallback
    if (questions.length === 0) {
      console.log('No unattempted questions found, fetching attempted ones...');
      const fallbackFilter: any = {
        attempts: {
          some: {
            userId: session.user.id,
          },
        },
      };

      if (topic) fallbackFilter.topic = topic;
      if (difficulty) fallbackFilter.difficulty = difficulty;

      questions = await prisma.question.findMany({
        where: fallbackFilter,
      });
    }

    // Check if any questions are found
    if (questions.length === 0) {
      return new Response("No questions found", { status: 404 });
    }

    // Pick a random question from the available list
    const randomIndex = Math.floor(Math.random() * questions.length);
    const randomQuestion = questions[randomIndex];

    return new Response(JSON.stringify(randomQuestion), { status: 200 });

  } catch (error) {
    console.log("[Pick Random] Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
