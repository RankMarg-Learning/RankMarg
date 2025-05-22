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

    /**
     * Generate a complete practice session for a user
     */
    async generate(userId: string, subjects: Subject[], grade: string): Promise<void> {
        try {
            // Initialize question selector once
            this.questionSelector = new QuestionSelector(
                this.prisma,
                userId,
                grade,
                this.config
            );

            // Process each subject in parallel for better performance
            await Promise.all(
                subjects.map(subject => this.generateSubjectSession(userId, subject))
            );
        } catch (error) {
            console.error('Error generating practice session:', error);
            throw error;
        }
    }

    /**
     * Generate a practice session for a single subject
     */
    private async generateSubjectSession(userId: string, subject: Subject): Promise<void> {
        const totalQuestionsForSubject = this.config.totalQuestions;
        const questionMap = new Map<string, Question>();

        // Calculate distribution based on configuration
        const distributions = this.calculateDistribution(totalQuestionsForSubject);

        // Fetch questions for each distribution category
        const questionsWithPriority = await this.fetchAllCategoryQuestions(subject, distributions);

        // Sort by priority and add to map to ensure uniqueness
        questionsWithPriority.sort((a, b) => a.priority - b.priority);
        for (const { question } of questionsWithPriority) {
            if (!questionMap.has(question.id)) {
                questionMap.set(question.id, question);
            }
        }

        // Handle shortfall of questions if needed
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

        // Shuffle and add to session
        const shuffledQuestions = this.shuffleArray(finalQuestions);
        await this.createPracticeSession(userId, shuffledQuestions, subject.id);
    }

    /**
     * Calculate distribution of questions across categories
     */
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

    /**
     * Fetch questions for all categories based on distribution
     */
    private async fetchAllCategoryQuestions(
        subject: Subject,
        distributions: QuestionDistribution[]
    ): Promise<Array<{ question: Question; priority: number }>> {
        // const allQuestions: Array<{ question: Question; priority: number }> = [];

        // Use Promise.all to fetch questions for all categories in parallel
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

    /**
     * Backfill questions if there weren't enough from the primary selection
     */
    private async backfillQuestions(
        subject: Subject,
        count: number,
        existingQuestions: Question[]
    ): Promise<Question[]> {
        const existingIds = new Set(existingQuestions.map(q => q.id));
        const backfilledQuestions: Question[] = [];

        // Calculate distribution for backfill
        const distributions = this.calculateDistribution(count);

        // Fetch additional questions for each category in parallel
        const additionalQuestionsPromises = distributions.map(({ source, count }) =>
            this.getAdditionalQuestions(subject, source, count, existingIds)
        );

        const additionalQuestionsArrays = await Promise.all(additionalQuestionsPromises);

        // Update existingIds as we go to avoid duplicates across categories
        for (const questions of additionalQuestionsArrays) {
            backfilledQuestions.push(...questions);
            questions.forEach(q => existingIds.add(q.id));
        }

        // If we still need more questions, get general backfill
        const stillNeeded = count - backfilledQuestions.length;
        if (stillNeeded > 0) {
            const generalBackfill = await this.getGeneralBackfillQuestions(subject, stillNeeded, existingIds);
            backfilledQuestions.push(...generalBackfill);
        }

        return backfilledQuestions;
    }

    /**
     * Get additional questions for a specific category
     */
    private async getAdditionalQuestions(
        subject: Subject,
        source: QuestionSource,
        count: number,
        existingIds: Set<string>
    ): Promise<Question[]> {
        if (count <= 0) return [];

        try {
            let questions: Question[] = [];
            const fetchFactor = 2; // Fetch more than needed to increase chances of finding unique questions

            // Get additional questions from the specified source
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

            // Filter out questions that are already in the existing set
            return questions
                .filter(q => !existingIds.has(q.id))
                .slice(0, count);
        } catch (error) {
            console.error(`Error getting additional ${source} questions:`, error);
            return [];
        }
    }

    /**
     * Get random questions as a last resort
     */
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

    /**
     * Create practice session in the database
     */
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

    /**
     * Shuffle array using Fisher-Yates algorithm
     */
    private shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

/**
 * Calculate estimated duration based on question difficulty and time
 */
function calculateEstimatedDuration(questions: Question[]): number {
    // Use reduce for cleaner calculation
    const totalBaseTime = questions.reduce((total, question) => {
        // Use nullish coalescing to handle undefined questionTime
        const questionTime = question.questionTime ?? (
            question.difficulty === 1 ? 1 :
                question.difficulty === 2 ? 2 : 3
        );
        return total + questionTime;
    }, 0);

    // Add buffer time and round up
    return Math.ceil(totalBaseTime * 1.1);
}