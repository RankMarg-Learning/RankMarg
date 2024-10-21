import { randomUUID } from "crypto";
import { socketManager, User } from "./SocketManager";
import { db } from "./db";
import { INIT_GAME } from "./messages";

export class Challenge {
  public challengeId: string;
  public player1Id: string;
  public player2Id: string | null;
  public result: string | null = null;
  public questions: any[] = [];
  public player1Score: number[] = [];
  public player2Score: number[] = [];
  private startTime = new Date(Date.now());
  private lastTime = new Date(Date.now());

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
      questionCount = 1;
    }
    this.loadRandomQuestions(questionCount);
    if (startTime) {
      this.startTime = startTime;
      this.lastTime = startTime;
    }
  }

  async loadRandomQuestions(questionCount: number) {
    try {
      const questions = await db.$queryRaw`
      SELECT * FROM "Question" 
      ORDER BY RANDOM() 
      LIMIT ${questionCount}
  `;
      this.questions.push(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  }

  async answerQuestion(user: User, questionId: string, isCorrect: string) {
    const question = this.questions.find((q) => q.id === questionId);
    if (!question) {
      console.error("Question not found?");
      return;
    }

    if (isCorrect) {
      if (user.userId === this.player1Id) {
        this.player1Score.push(1);
      } else {
        this.player2Score.push(1);
      }
    } else {
      if (user.userId === this.player1Id) {
        this.player1Score.push(0);
      } else {
        this.player2Score.push(0);
      }
    }

    this.lastTime = new Date(Date.now());

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

    //!This Logic for isChallengeOver is some what wrong plz test it.
    if (this.isChallengeOver()) {
      this.endChellenge();
    }
  }

  isChallengeOver() {
    return (
      this.questions.length === this.player1Score.length ||
      this.player2Score.length
    );
  }

  async endChellenge() {
    this.result =
      this.player1Score > this.player2Score
        ? this.player1Id
        : this.player1Score < this.player2Score
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
        type: "GAME_STARTED",
        payload: {
          gameId: this.challengeId,
          Player1: {
            name: Player1?.username,
            id: this.player1Id,
            isGuest: false,
          },
          Player2: {
            name: Player2?.username,
            id: this.player2Id,
            isGuest: false,
          },
          questions: this.questions, //TODO:questions: this.questions.map(q => ({ id: q._id, content: q.content })),
        },
      })
    );
  }
  async createGameInDb() {
    this.startTime = new Date(Date.now());
    this.lastTime = this.startTime;

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
      },
    });
    this.challengeId = challenge.challengeId;
  }
}
