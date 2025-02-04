import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

interface TestSection {
  name: string
  isOptional: boolean
  maxQuestions: number
  markingSchema: {
    correct: number
    incorrect: number
  }
  questions: string[]
}

export async function POST(req: Request) {
    const body = await req.json();
    const { title, description, stream, duration, testKey, sections, startTime, endTime, examType } = body;
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new Response("Unauthorized", { status: 401 });
        }

        const userExists = await prisma.user.findUnique({
            where: { id: session.user.id },
        });
        if (!userExists) {
            return new Response("User not found", { status: 404 });
        }
        const totalQuestions = sections.reduce((total, section) => total + section.questions.length, 0);

        const totalMarks = sections.reduce((total, section) => {
            const numQuestions = section.questions.length;
            const consideredQuestions = section.isOptional
                ? Math.min(numQuestions, section.maxQuestions) 
                : numQuestions;
        
            const sectionMarks = section.markingSchema.correct * consideredQuestions;
            return total + sectionMarks;
        }, 0);

        

        const test = await prisma.test.create({
            data: {
                title,
                description,
                stream,
                startTime: startTime,
                endTime: endTime,
                duration: parseInt(duration),
                testKey,
                totalMarks,
                totalQuestions,
                examType,
                createdBy: session.user.id,
                TestSection: {
                    create: sections.map((section: TestSection) => ({
                        name: section.name,
                        isOptional: section.isOptional,
                        maxQuestions: section.maxQuestions,
                        correctMarks: section.markingSchema.correct,
                        negativeMarks: section.markingSchema.incorrect,
                        TestQuestion: {
                            create: section.questions.map((questionId: string) => ({
                                questionId,
                            })),
                        },
                    })),
                },
            },
        });
        return new Response(JSON.stringify(test), { status: 200 });
    } catch (error) {
        console.error("[CreateTest]:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}


export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    searchParams.get('examType');
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new Response("Unauthorized", { status: 401 });
        }

        const tests = await prisma.test.findMany({
           where:{
                createdBy: session.user.id,
           },
            orderBy: {
                createdAt: "desc",
            },
        });

        return new Response(JSON.stringify(tests), { status: 200 });
    } catch (error) {
        console.error("[GetTests]:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}


