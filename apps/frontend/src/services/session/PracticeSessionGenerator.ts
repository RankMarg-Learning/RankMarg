import { PrismaClient, Subject, Question } from '@prisma/client';
import { QuestionSelector } from './QuestionSelector';
import { SessionConfig } from '@/types/session.api.types';

type QuestionSource = 'currentTopic' | 'weakConcepts' | 'revisionTopics' | 'pyq';

interface QuestionDistribution {
    source: QuestionSource;
    count: number;
    priority: number;
}

export class PracticeSessionGenerator {
    private questionSelector: QuestionSelector;

    constructor(
        private readonly prisma: PrismaClient,
        private readonly config: SessionConfig
    ) { }

    async generate(userId: string, subjects: Subject[], grade: string): Promise<void> {
        try {
            this.questionSelector = new QuestionSelector(
                this.prisma,
                userId,
                grade,
                this.config
            );

            await Promise.all(
                subjects.map(subject => this.generateSubjectSession(userId, subject))
            );
        } catch (error) {
            console.error('Error generating practice session:', error);
            throw error;
        }
    }

    private async generateSubjectSession(userId: string, subject: Subject): Promise<void> {
        const totalQuestionsForSubject = this.config.totalQuestions;
        const questionMap = new Map<string, Question>();

        const distributions = this.calculateDistribution(totalQuestionsForSubject);
        const questionsWithPriority = await this.fetchAllCategoryQuestions(subject, distributions);

        questionsWithPriority.sort((a, b) => a.priority - b.priority);
        for (const { question } of questionsWithPriority) {
            if (!questionMap.has(question.id)) {
                questionMap.set(question.id, question);
            }
        }

        const uniqueQuestions = Array.from(questionMap.values());
        const shortfall = totalQuestionsForSubject - uniqueQuestions.length;

        if (shortfall > 0) {
            const additionalQuestions = await this.backfillQuestions(subject, shortfall, uniqueQuestions);
            for (const question of additionalQuestions) {
                if (!questionMap.has(question.id)) {
                    questionMap.set(question.id, question);
                }
            }
        }

        const finalQuestions = Array.from(questionMap.values());

        if (finalQuestions.length < totalQuestionsForSubject) {
            console.warn(
                `Could only find ${finalQuestions.length} unique questions for subject ${subject.name}, ` +
                `wanted ${totalQuestionsForSubject}`
            );
        }

        const shuffledQuestions = this.shuffleArray(finalQuestions);
        await this.createPracticeSession(userId, shuffledQuestions, subject.id);
    }

    private calculateDistribution(totalQuestions: number): QuestionDistribution[] {
        return [
            {
                source: 'currentTopic',
                count: Math.round(totalQuestions * this.config.distribution.currentTopic),
                priority: 1
            },
            {
                source: 'weakConcepts',
                count: Math.round(totalQuestions * this.config.distribution.weakConcepts),
                priority: 2
            },
            {
                source: 'revisionTopics',
                count: Math.round(totalQuestions * this.config.distribution.revisionTopics),
                priority: 3
            },
            {
                source: 'pyq',
                count: Math.round(totalQuestions * this.config.distribution.pyq),
                priority: 4
            }
        ];
    }


    private async fetchAllCategoryQuestions(
        subject: Subject,
        distributions: QuestionDistribution[]
    ): Promise<Array<{ question: Question; priority: number }>> {

        const questionPromises = distributions.map(async ({ source, count, priority }) => {
            let questions: Question[] = [];

            switch (source) {
                case 'currentTopic':
                    questions = await this.questionSelector.selectCurrentTopicQuestions(subject, count);
                    break;
                case 'weakConcepts':
                    questions = await this.questionSelector.selectWeakConceptQuestions(subject, count);
                    break;
                case 'revisionTopics':
                    questions = await this.questionSelector.selectRevisionQuestions(subject, count);
                    break;
                case 'pyq':
                    questions = await this.questionSelector.selectPYQs(subject, count);
                    break;
            }

            return questions.map(question => ({ question, priority }));
        });

        const results = await Promise.all(questionPromises);
        return results.flat();
    }


    private async backfillQuestions(
        subject: Subject,
        count: number,
        existingQuestions: Question[]
    ): Promise<Question[]> {
        const existingIds = new Set(existingQuestions.map(q => q.id));
        const backfilledQuestions: Question[] = [];

        const distributions = this.calculateDistribution(count);

        const additionalQuestionsPromises = distributions.map(({ source, count }) =>
            this.getAdditionalQuestions(subject, source, count, existingIds)
        );

        const additionalQuestionsArrays = await Promise.all(additionalQuestionsPromises);

        for (const questions of additionalQuestionsArrays) {
            backfilledQuestions.push(...questions);
            questions.forEach(q => existingIds.add(q.id));
        }

        const stillNeeded = count - backfilledQuestions.length;
        if (stillNeeded > 0) {
            const generalBackfill = await this.getGeneralBackfillQuestions(subject, stillNeeded, existingIds);
            backfilledQuestions.push(...generalBackfill);
        }

        return backfilledQuestions;
    }

    private async getAdditionalQuestions(
        subject: Subject,
        source: QuestionSource,
        count: number,
        existingIds: Set<string>
    ): Promise<Question[]> {
        if (count <= 0) return [];

        try {
            let questions: Question[] = [];
            const fetchFactor = 2; 
            switch (source) {
                case 'currentTopic':
                    questions = await this.questionSelector.selectCurrentTopicQuestions(subject, count * fetchFactor);
                    break;
                case 'weakConcepts':
                    questions = await this.questionSelector.selectWeakConceptQuestions(subject, count * fetchFactor);
                    break;
                case 'revisionTopics':
                    questions = await this.questionSelector.selectRevisionQuestions(subject, count * fetchFactor);
                    break;
                case 'pyq':
                    questions = await this.questionSelector.selectPYQs(subject, count * fetchFactor);
                    break;
            }

            return questions
                .filter(q => !existingIds.has(q.id))
                .slice(0, count);
        } catch (error) {
            console.error(`Error getting additional ${source} questions:`, error);
            return [];
        }
    }

    
    private async getGeneralBackfillQuestions(
        subject: Subject,
        count: number,
        existingIds: Set<string>
    ): Promise<Question[]> {
        try {
            return await this.prisma.question.findMany({
                where: {
                    subjectId: subject.id,
                    id: {
                        notIn: Array.from(existingIds)
                    },
                    isPublished: true
                },
                include: {
                    options: true
                },
                take: count
            });
        } catch (error) {
            console.error('Error getting general backfill questions:', error);
            return [];
        }
    }

    private async createPracticeSession(
        userId: string,
        questions: Question[],
        subjectId: string
    ): Promise<void> {
        try {
            await this.prisma.practiceSession.create({
                data: {
                    userId,
                    questionsSolved: 0,
                    correctAnswers: 0,
                    subjectId,
                    duration: calculateEstimatedDuration(questions),
                    questions: {
                        create: questions.map(question => ({
                            questionId: question.id,
                        }))
                    }
                }
            });
        } catch (error) {
            console.error('Error creating practice session:', error);
            throw error;
        }
    }

    private shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}


function calculateEstimatedDuration(questions: Question[]): number {

    const totalBaseTime = questions.reduce((total, question) => {
        const questionTime = question.questionTime ?? (
            question.difficulty === 1 ? 1 :
                question.difficulty === 2 ? 2 : 3
        );
        return total + questionTime;
    }, 0);

    return Math.ceil(totalBaseTime * 1.1);
}