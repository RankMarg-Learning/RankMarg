import { randomUUID } from "crypto";
import { socketManager, User } from "./SocketManager";
import { db } from "./db";
import { Question } from "@prisma/client";

export class Challenge {
  public challengeId: string;
  public player1Id: string;
  public player2Id: string | null;
  public result: string | null = null;
  public questions: Question[] = [];
  public player1Score: number[] = [];
  public player2Score: number[] = [];
  private startTime = new Date(Date.now());
  private timeoutId: NodeJS.Timeout | null = null;
  private timeLimit: number = 100000;

  constructor(
    player1UserId: string,
    player2UserId: string | null,
    questionCount?: number,
    challengeId?: string,
    startTime?: Date
  ) {
    this.player1Id = player1UserId;
    this.player2Id = player2UserId;
    this.challengeId = challengeId ?? randomUUID();
    if (!questionCount) {
      questionCount = 2;
    }
    this.loadRandomQuestions(questionCount);
    if (startTime) {
      this.startTime = startTime;
    }
  }

  startChallengeTimer() {
    this.timeoutId = setInterval(() => {
      const elapsedTime = Date.now() - this.startTime.getTime();
      const remainingTime = this.timeLimit - elapsedTime;

      if (remainingTime <= 0) {
        clearInterval(this.timeoutId!);
        this.endChellenge();
      } else {
        // console.log("Remaining time:", remainingTime);
        // Emit the remaining time to the frontend
      }
    }, 1000);
  }

  async loadRandomQuestions(questionCount: number) {
    try {
      const questions: Question[] = await db.$queryRaw`
      SELECT * FROM "Question" 
      ORDER BY RANDOM() 
      LIMIT ${questionCount}
  `;
      this.timeCalculate();
      this.questions.push(...questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  }

  timeCalculate() {
    if (this.questions.length > 0) {
      this.questions.forEach((question) => {
        if (question.questionTime) this.timeLimit += question.questionTime;
      });
    }
  }

  async answerQuestion(user: User, questionId: string, isCorrect: boolean) {
    const question = this.questions.find((q) => {
      return q.id === questionId;
    });

    console.log("Question:", this.questions.length);

    if (!question) {
      console.error("Question not found?");
      return;
    }

    if (user.userId === this.player1Id) {
      this.player1Score.push(isCorrect ? 1 : 0);
      // this.player1Times.push(timeTaken);
    } else {
      this.player2Score.push(isCorrect ? 1 : 0);
      // this.player2Times.push(timeTaken);
    }

    socketManager.broadcast(
      this.challengeId,
      JSON.stringify({
        type: "QUESTION_ANSWERED",
        payload: {
          questionId,
          isCorrect,
          player1Answers: this.player1Score,
          player2Answers: this.player2Score,
        },
      })
    );

    console.log(this.isChallengeOver());
    if (this.isChallengeOver()) {
      this.endChellenge();
    }
  }

  isChallengeOver() {
    return (
      this.player1Score.length === this.questions.length &&
      this.player2Score.length === this.questions.length
    );
  }

  async endChellenge() {
    const player1TotalScore = this.player1Score.reduce((a, b) => a + b, 0); // Sum of player 1 scores
    const player2TotalScore = this.player2Score.reduce((a, b) => a + b, 0);

    this.result =
      player1TotalScore > player2TotalScore
        ? this.player1Id
        : player1TotalScore < player2TotalScore
          ? this.player1Id
          : "DRAW";
    await db.challenge.update({
      where: {
        challengeId: this.challengeId,
      },
      data: {
        status: "COMPLETED",
        // endAt: new Date(Date.now()),
        result: this.result,
        player1Score: 40, //!this is dummy data
        player2Score: -40, //!this is dummy data
      },
    });
    socketManager.broadcast(
      this.challengeId,
      JSON.stringify({
        type: "GAME_OVER",
        payload: {
          result: this.result,
          player1Score: this.player1Score,
          player2Score: this.player2Score,
        },
      })
    );
  }

  async updateSecondPlayer(player2Id: string) {
    this.player2Id = player2Id;

    const users = await db.user.findMany({
      where: {
        id: {
          in: [this.player1Id, this.player2Id ?? ""],
        },
      },
    });

    try {
      await this.createGameInDb();
    } catch (e) {
      console.error(e);
      return;
    }

    const Player1 = users.find((user: any) => user.id === this.player1Id);
    const Player2 = users.find((user: any) => user.id === this.player2Id);

    socketManager.broadcast(
      this.challengeId,
      JSON.stringify({
        type: "CHALLENGE_START",
        payload: {
          challengeId: this.challengeId,
          Player1: {
            name: Player1?.username,
            id: this.player1Id,
          },
          Player2: {
            name: Player2?.username,
            id: this.player2Id,
          },
          questions: this.questions, //TODO:questions: this.questions.map(q => ({ id: q._id, content: q.content })),
        },
      })
    );
    this.startChallengeTimer();
  }
  async createGameInDb() {
    this.startTime = new Date(Date.now());

    const challenge = await db.challenge.create({
      data: {
        challengeId: this.challengeId,
        status: "IN_PROGRESS",
        updatedAt: this.startTime,
        player1: {
          connect: {
            id: this.player1Id,
          },
        },
        player2: {
          connect: {
            id: this.player2Id ?? "",
          },
        },
        ChallengeQuestion: {
          create: this.questions.map((q) => ({
            questionId: q.id,
          })),
        },
      },
    });
    this.challengeId = challenge.challengeId;
  }
}
