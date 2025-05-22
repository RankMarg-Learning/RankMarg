import prisma from "@/lib/prisma";
import { StudentGradeCalculator } from "../session/StudentGradeCalculator";
import { Stream } from "@prisma/client";
import { createDefaultSessionConfig } from "../session/SessionConfig";
import { PracticeSessionGenerator } from "../session/PracticeSessionGenerator";

export class PracticeService {



    async processUserBatch(batchSize: number, offset: number) {
        const users = await prisma.user.findMany({
            select: { id: true },
            skip: offset,
            take: batchSize,
        });
        for (const user of users) {
            await this.generateSessionForUser(user.id);
        }
    }
    public async generateSessionForUser(userId: string, totalQuestions: number = 20) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                userPerformance: true,
                currentStudyTopic: {
                    where: { isCurrent: true },
                    include: { subject: true, topic: true }
                }
            }
        });

        if (!user) {
            throw new Error(`User with ID ${userId} not found`);
        }

        const gradeCalculator = new StudentGradeCalculator(prisma);
        const studentGrade = await gradeCalculator.calculateGrade(userId);
        const subjects = await prisma.subject.findMany({
            where: {
                stream: user.stream as Stream
            }
        });

        const config = createDefaultSessionConfig(user.stream as Stream, studentGrade, totalQuestions);
        const sessionGenerator = new PracticeSessionGenerator(prisma, config);
        const practiceSession = await sessionGenerator.generate(userId, subjects, studentGrade);
        console.log(`Generated session for user ${userId}:`, practiceSession);



        return {
            userId,
            generatedAt: new Date(),
        };
    }

}