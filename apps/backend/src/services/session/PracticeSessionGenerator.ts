import { PrismaClient } from "@prisma/client";
import { QuestionSelector } from "./QuestionSelector";
import { SessionConfig } from "@/types/session.api.types";

type QuestionSource =
  | "currentTopic"
  | "weakConcepts"
  | "revisionTopics"
  | "pyq";

interface QuestionDistribution {
  source: QuestionSource;
  count: number;
  priority: number;
}

export class PracticeSessionGenerator {
  private questionSelector!: QuestionSelector;

  constructor(
    private readonly prisma: PrismaClient,
    private readonly config: SessionConfig
  ) {}

  async generate(): Promise<void> {
    try {
      this.questionSelector = new QuestionSelector(this.prisma, this.config);

      const examSubjects = await this.prisma.examSubject.findMany({
        where: { examCode: this.config.examCode },
        select: { subjectId: true },
      });
      const subjectIds = examSubjects.map((es) => es.subjectId);

      if (subjectIds.length === 0) {
        console.error("No subjects found for exam code:", this.config.examCode);
        return;
      }

      await Promise.all(
        subjectIds.map((subjectId) => {
          if (this.config.isPaidUser) {
            this.generateSubjectSessionAdaptive(subjectId);
          } else {
            this.generateSubjectSession(subjectId);
          }
        })
      );
    } catch (error) {
      console.error("Error generating practice session:", error);
      throw error;
    }
  }

  private async generateSubjectSession(subjectId: string): Promise<void> {
    try {
      const totalQuestionsForSubject = this.config.subjectwiseQuestions.find(subject => subject.subjectId === subjectId)?.questions || 18;
      const questionMap = new Map<string, { id: string }>();

      const questions = await this.questionSelector.selectCurrentTopicQuestions(
        subjectId,
        totalQuestionsForSubject
      );

      for (const question of questions) {
        if (!questionMap.has(question.id)) {
          questionMap.set(question.id, question);
        }
      }
      const finalQuestions = Array.from(questionMap.values());
      const shuffledQuestions = this.shuffleArray(finalQuestions);
      await this.createPracticeSession(shuffledQuestions, subjectId);
    } catch (error) {
      console.error("Error generating practice session:", error);
      throw error;
    }
  }

  private async generateSubjectSessionAdaptive(
    subjectId: string
  ): Promise<void> {
    try {
      const totalQuestionsForSubject = this.config.subjectwiseQuestions.find(subject => subject.subjectId === subjectId)?.questions || 18;
      const questionMap = new Map<string, { id: string }>();
      console.log("totalQuestionsForSubject", totalQuestionsForSubject);
      const distributions = this.calculateDistribution(
        totalQuestionsForSubject
      );

      const questionsWithPriority = await this.fetchAllCategoryQuestions(
        subjectId,
        distributions
      );

      questionsWithPriority.sort((a, b) => a.priority - b.priority);
      for (const { question } of questionsWithPriority) {
        if (!questionMap.has(question.id)) {
          questionMap.set(question.id, question);
        }
      }

      const finalQuestions = Array.from(questionMap.values());

      const shuffledQuestions = this.shuffleArray(finalQuestions);
      await this.createPracticeSession(shuffledQuestions, subjectId);
    } catch (error) {
      console.error("Error generating practice session:", error);
      throw error;
    }
  }

  private calculateDistribution(
    totalQuestions: number
  ): QuestionDistribution[] {
    return [
      {
        source: "currentTopic",
        count: Math.round(
          totalQuestions * this.config.distribution.currentTopic
        ),
        priority: 1,
      },
      {
        source: "weakConcepts",
        count: Math.round(
          totalQuestions * this.config.distribution.weakConcepts
        ),
        priority: 2,
      },
      {
        source: "revisionTopics",
        count: Math.round(
          totalQuestions * this.config.distribution.revisionTopics
        ),
        priority: 3,
      },
    ];
  }

  private async fetchAllCategoryQuestions(
    subjectId: string,
    distributions: QuestionDistribution[]
  ): Promise<Array<{ question: { id: string }; priority: number }>> {
    await this.questionSelector.getAttemptedQuestionIds();

    const questionPromises = distributions.map(
      async ({ source, count, priority }) => {
        let questions: { id: string; difficulty: number }[] = [];

        switch (source) {
          case "currentTopic":
            questions = await this.questionSelector.selectCurrentTopicQuestions(
              subjectId,
              count
            );
            break;
          case "weakConcepts":
            questions = await this.questionSelector.selectWeakConceptQuestions(
              subjectId,
              count
            );
            break;
          case "revisionTopics":
            questions = await this.questionSelector.selectRevisionQuestions(
              subjectId,
              count
            );
            break;
        }

        return questions.map((question) => ({ question, priority }));
      }
    );

    const results = await Promise.all(questionPromises);
    return results.flat();
  }

  private async createPracticeSession(
    questions: { id: string }[],
    subjectId: string
  ): Promise<any> {
    try {
      const session = await this.prisma.practiceSession.create({
        data: {
          userId: this.config.userId,
          questionsSolved: 0,
          correctAnswers: 0,
          subjectId,
          duration: questions.length * 90,
          questions: {
            create: questions.map((question: { id: string }) => ({
              questionId: question.id,
            })),
          },
        },
      });
      return session;
    } catch (error) {
      console.error("Error creating practice session:", error);
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
