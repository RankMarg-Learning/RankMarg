import { WebSocket } from "ws";
import {
  GAME_OVER,
  INIT_GAME,
  JOIN_GAME,
  MOVE,
  OPPONENT_DISCONNECTED,
  JOIN_ROOM,
  GAME_JOINED,
  GAME_NOT_FOUND,
  GAME_ALERT,
  GAME_ADDED,
  GAME_ENDED,
  EXIT_GAME,
} from "./messages";
import { Challenge } from "./Challenge";
import { db } from "./db";
import { socketManager, User } from "./SocketManager";

export class ChallengeManager {
  private challenges: Challenge[];
  private pendingChallengeId: string | null;
  private users: User[];

  constructor() {
    this.challenges = [];
    this.pendingChallengeId = null;
    this.users = [];
  }

  addUser(user: User) {
    this.users.push(user);
    this.addHandler(user);
  }

  removeUser(socket: WebSocket) {
    const user = this.users.find((user) => user.socket === socket);
    if (!user) {
      console.error("User not found?");
      return;
    }
    this.users = this.users.filter((user) => user.socket !== socket);
    socketManager.removeUser(user);
  }

  removeGame(challengeId: string) {
    this.challenges = this.challenges.filter(
      (g) => g.challengeId !== challengeId
    );
  }

  private addHandler(user: User) {
    user.socket.on("message", async (data) => {
      const message = JSON.parse(data.toString());
      if (message.type === INIT_GAME) {
        if (this.pendingChallengeId) {
          const challenge = this.challenges.find(
            (x) => x.challengeId === this.pendingChallengeId
          );
          if (!challenge) {
            console.error("Pending challenge not found?");
            return;
          }
          if (user.userId === challenge.player1Id) {
            socketManager.broadcast(
              challenge.challengeId,
              JSON.stringify({
                type: GAME_ALERT,
                payload: {
                  message: "Trying to Connect with yourself?",
                },
              })
            );
            return;
          }
          socketManager.addUser(user, challenge.challengeId);
          await challenge?.updateSecondPlayer(user.userId);
          this.pendingChallengeId = null;
        } else {
          const challenge = new Challenge(user.userId, null);

          this.challenges.push(challenge);
          this.pendingChallengeId = challenge.challengeId;
          socketManager.addUser(user, challenge.challengeId);
          socketManager.broadcast(
            challenge.challengeId,
            JSON.stringify({
              type: GAME_ADDED,
              challengeId: challenge.challengeId,
            })
          );
        }
      }

      if (message.type === MOVE) {
        const challengeId = message.payload.challengeId;
        const challenge = this.challenges.find(
          (challenge) => challenge.challengeId === challengeId
        );
        if (challenge) {
          challenge.answerQuestion(
            user,
            message.payload.questionId,
            message.payload.isCorrect
          );
          if (challenge.result) {
            this.removeGame(challenge.challengeId);
          }
        }
      }

      if (message.type === EXIT_GAME) {
        const challengeId = message.payload.challengeId;
        const challenge = this.challenges.find(
          (challenge) => challenge.challengeId === challengeId
        );

        if (challenge) {
          this.removeGame(challenge.challengeId);
        }
      }

      if (message.type === JOIN_ROOM) {
        const challengeId = message.payload?.challengeId;
        if (!challengeId) {
          return;
        }

        let availableGame = this.challenges.find(
          (challenge) => challenge.challengeId === challengeId
        );
        const challengeFromDb = await db.challenge.findUnique({
          where: { challengeId },
          include: {
            questions: true,
            player1: true,
            player2: true,
          },
        });

        // There is a challenge created but no second player available

        if (availableGame && !availableGame.player2Id) {
          socketManager.addUser(user, availableGame.challengeId);
          await availableGame.updateSecondPlayer(user.userId);
          return;
        }

        if (!challengeFromDb) {
          user.socket.send(
            JSON.stringify({
              type: GAME_NOT_FOUND,
            })
          );
          return;
        }

        if (challengeFromDb.status !== "IN_PROGRESS") {
          user.socket.send(
            JSON.stringify({
              type: GAME_ENDED,
              payload: {
                result: challengeFromDb.result,
                status: challengeFromDb.status,
                questions: challengeFromDb.questions,
                player1: {
                  id: challengeFromDb.player1.id,
                  username: challengeFromDb.player1.username,
                },
                player2: {
                  id: challengeFromDb.player2?.id,
                  username: challengeFromDb.player2?.username,
                },
              },
            })
          );
          return;
        }

        //TODO: Some issue here
        if (!availableGame) {
          const challenge = new Challenge(
            challengeFromDb?.player1Id!,
            challengeFromDb?.player2Id!
          );
          // challenge.seedMoves(challengeFromDb?.moves || []);
          this.challenges.push(challenge);
          availableGame = challenge;
        }

        user.socket.send(
          JSON.stringify({
            type: GAME_JOINED,
            payload: {
              challengeId,
              questions: challengeFromDb.questions,
              player1: {
                id: challengeFromDb.player1.id,
                username: challengeFromDb.player1.username,
              },
              player2: {
                id: challengeFromDb.player2?.id,
                username: challengeFromDb.player2?.username,
              },
            },
          })
        );

        socketManager.addUser(user, challengeId);
      }
    });
  }
}
