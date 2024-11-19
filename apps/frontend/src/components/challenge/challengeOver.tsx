import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Trophy } from 'lucide-react'
import Link from 'next/link'
import { Question } from '@prisma/client'
import { DetailsProps } from '@/types'




const ChallengeOver = ({ details }: { details: DetailsProps }) => {
  const { result, questions, player1, player2, status } = details

  const resultMessage = result === player1.id
    ? `${player1.username} is the Winner!`
    : result === player2.id
      ? `${player2.username} is the Winner!`
      : 'It\'s a Draw!'

  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-3xl border-yellow-500 border-2">
        <CardHeader className="bg-yellow-400 text-yellow-900">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-center">Challenge Result</CardTitle>
          <div className="flex justify-center items-center space-x-2 mt-4">
            <Trophy className="w-6 h-6 sm:w-8 sm:h-8" />
            <h2 className={`text-xl sm:text-2xl text-center font-semibold ${status === 'won' ? 'text-green-700' : 'text-yellow-700'}`}>
              {resultMessage}
            </h2>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-around mb-6 sm:mb-8">
            {[player1, player2].map((player, index) => (
              <div key={index} className="text-center px-4 mb-4 sm:mb-0">
                <h3 className="font-semibold text-lg sm:text-xl text-yellow-900"><Link href={`/u/${player.username}`}>{player.username}</Link></h3>
                <Badge variant="outline" className="mt-2">Rank: {player.rank}</Badge>
              </div>
            ))}
          </div>

          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-yellow-900">Question Results</h3>
          <ul className="space-y-4">
            {questions.map((question: Question, index: number) => (
              <li key={index} className="border-b border-yellow-200 pb-4 last:border-b-0">
                <div className=" justify-between items-start sm:items-center mb-2">
                  <div className="text-yellow-900 mb-2 sm:mb-0">
                    <span className="font-semibold">Q{index + 1}: {question.topic}</span>
                    <Badge variant="secondary" className="ml-2">{question.difficulty}</Badge>
                  </div>
                  <div className="flex flex-col justify-between  sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-2">
                    {[player1, player2].map((player, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-yellow-900">{player.username}:</span>
                        {player.attempt[index] === 1 ? (
                          <CheckCircle className="text-green-500 w-5 h-5" aria-label="Correct" />
                        ) : (
                          <XCircle className="text-red-500 w-5 h-5" aria-label="Incorrect" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 sm:mt-8 text-center">
            <Link href="/challenge"
              className="bg-yellow-500 hover:bg-yellow-600 text-yellow-900 font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-full transition-all duration-200 transform hover:scale-105 w-full sm:w-auto"
            >
              Play Again
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ChallengeOver