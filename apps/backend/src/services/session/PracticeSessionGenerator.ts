import { PrismaClient } from "@prisma/client";
import { QuestionSelector } from "./QuestionSelector";
import { SessionConfig } from "@/types/session.api.types";
import { NotificationService } from "@/services/notification.service";
import { captureServiceError } from "../../lib/sentry";

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
  ) { }

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
            return this.generateSubjectSessionAdaptive(subjectId);
          } else {
            return this.generateSubjectSession(subjectId);
          }
        })
      );

      try {
        const template = NotificationService.templates.practiceSessionCreated();
        await NotificationService.createAndDeliverToUser(
          this.config.userId,
          template.type,
          template.title,
          template.message
        );
      } catch (notificationError) {
        console.error("Error sending notification:", notificationError);
      }
    } catch (error) {
      console.error("Error generating practice session:", error);
      if (error instanceof Error) {
        captureServiceError(error, {
          service: "PracticeSessionGenerator",
          method: "generate",
          userId: this.config.userId,
          additionalData: {
            examCode: this.config.examCode,
            isPaidUser: this.config.isPaidUser,
          },
        });
      }
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
      if (error instanceof Error) {
        captureServiceError(error, {
          service: "PracticeSessionGenerator",
          method: "generateSubjectSession",
          userId: this.config.userId,
          additionalData: {
            subjectId,
            examCode: this.config.examCode,
          },
        });
      }
      throw error;
    }
  }

  private async generateSubjectSessionAdaptive(
    subjectId: string
  ): Promise<void> {
    try {
      const totalQuestionsForSubject = this.config.subjectwiseQuestions.find(subject => subject.subjectId === subjectId)?.questions || 18;
      const questionMap = new Map<string, { id: string }>();

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
      if (error instanceof Error) {
        captureServiceError(error, {
          service: "PracticeSessionGenerator",
          method: "generateSubjectSessionAdaptive",
          userId: this.config.userId,
          additionalData: {
            subjectId,
            examCode: this.config.examCode,
          },
        });
      }
      throw error;
    }
  }

  private calculateDistribution(
    totalQuestions: number
  ): QuestionDistribution[] {

    const date = new Date().getDate();
    return [
      {
        source: "currentTopic",
        count: Math.round(
          totalQuestions * this.config.distribution.currentTopic
        ),
        priority: 1,
      },
      {
        source: date % 2 === 0 ? "weakConcepts" : "revisionTopics",
        count: Math.round(
          totalQuestions * (date % 2 === 0 ? this.config.distribution.weakConcepts : this.config.distribution.revisionTopics)
        ),
        priority: 2,
      }
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
  ) {
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
      if (error instanceof Error) {
        captureServiceError(error, {
          service: "PracticeSessionGenerator",
          method: "createPracticeSession",
          userId: this.config.userId,
          additionalData: {
            subjectId,
            questionCount: questions.length,
          },
        });
      }
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
