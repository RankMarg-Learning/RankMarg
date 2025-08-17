import prisma from "@/lib/prisma";
import { testQuestion, testSection } from "@/types/typeAdmin";
import { jsonResponse } from "@/utils/api-response";


export async function POST(req: Request) {
    const body = await req.json();
    const { title, description, examCode, duration, testKey, testSection, startTime, endTime, examType, difficulty, status, visibility } = body;
    try {

        // if (!session?.user?.id) {
        //     return new Response("Unauthorized", { status: 401 });
        // }

        // const userExists = await prisma.user.findUnique({
        //     where: { id: session.user.id },
        // });
        // if (!userExists) {
        //     return new Response("User not found", { status: 404 });
        // }

        const calculateTotalMarks = (testSections: {
            testQuestion: { id: string }[];
            maxQuestions?: number;
            isOptional: boolean;
            correctMarks: number;
        }[]) => {
            return testSections.reduce((total, section) => {
                const consideredQuestions = section.isOptional ? Math.min(section.testQuestion.length, section.maxQuestions) : section.testQuestion.length;

                return total + consideredQuestions * section.correctMarks;
            }, 0);
        };
        const totalMarks = calculateTotalMarks(testSection.map(section => ({
            testQuestion: section.testQuestion || [],
            maxQuestions: section.maxQuestions,
            isOptional: section.isOptional,
            correctMarks: section.correctMarks || 0
        })));
        const totalQuestions = testSection.reduce(
            (total, section) => total + section.testQuestion.length,
            0
        );


        await prisma.test.create({
            data: {
                title,
                description,
                examCode,
                totalMarks,
                totalQuestions,
                status,
                visibility,
                testKey,
                difficulty,
                examType,
                duration: duration,
                startTime: startTime,
                endTime: endTime,
                createdBy: "0aad2b65-5334-4ab2-b6c8-1e37d97dc3f5",
                testSection: {
                    create: testSection.map((section: testSection) => ({
                        name: section.name,
                        isOptional: section.isOptional,
                        maxQuestions: section.maxQuestions,
                        correctMarks: section.correctMarks,
                        negativeMarks: section.negativeMarks,
                        testQuestion: {
                            create: section.testQuestion.map((question: testQuestion) => ({
                                questionId: question.id,
                            })),
                        },
                    })),
                },
            },
        });

        return jsonResponse(null, { success: true, message: "Test created successfully", status: 201 });
    } catch (error) {
        console.error("[CreateTest]:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}


export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    searchParams.get('examType');
    try {

        // if (!session?.user?.id) {
        //     return new Response("Unauthorized", { status: 401 });
        // }

        const tests = await prisma.test.findMany({
            //    where:{
            //         createdBy: session.user.id,
            //    },
            orderBy: {
                createdAt: "desc",
            },
        });

        return jsonResponse(tests, { success: true, message: "User fetched successfully", status: 200 });
    } catch (error) {
        console.error("[GetTests]:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}


