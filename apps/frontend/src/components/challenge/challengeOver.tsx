import React from 'react';

const ChallengeOver = ({ details }: any) => {
  const { result, questions, player1, player2, status } = details;

  // Determine the result message
  const resultMessage = result === player1.id
    ? `${player1.username} is the Winner!`
    : result === player2.id
      ? `${player2.username} is the Winner!`
      : 'It’s a Draw!';

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-3xl w-full">
        {/* Challenge Result */}
        <h1 className="text-2xl font-bold text-center mb-6">Challenge Result</h1>
        <h2 className={`text-xl font-semibold text-center mb-6 ${status === 'won' ? 'text-green-600' : 'text-yellow-600'}`}>
          {resultMessage}
        </h2>

        {/* Player Scores */}
        <div className="flex justify-around mb-8">
          {[player1, player2].map((player, index) => (
            <div key={index} className="flex-1 text-center px-4">
              <h3 className="font-semibold text-lg">{player.username}</h3>
              <p className="text-gray-500">Rank: {player.rank}</p>
            </div>
          ))}
        </div>

        {/* Questions and Attempts */}
        <h3 className="text-lg font-semibold mb-4">Question Results</h3>
        <ul className="divide-y divide-gray-200">
          {questions.map((question: any, index: number) => (
            <li key={index} className="py-4">
              <div className="flex justify-between items-center">
                <div className="text-gray-800">
                  <span className="font-semibold">Q{index + 1}:
                   {question.topic}, Difficulty: {question.difficulty}</span>
                </div>
              </div>

              {/* Player Attempts */}
              <div className="flex justify-around mt-2">
                {[player1, player2].map((player, idx) => (
                  <div key={idx} className="flex-1 text-center">
                    <span className="text-sm">{player.username}</span>
                    <p className={`font-semibold ${player.attempt[index] === 1 ? 'text-green-600' : 'text-red-600'}`}>
                      {player.attempt[index] === 1 ? 'Correct' : 'Wrong'}
                    </p>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>

        {/* Play Again Button */}
        <div className="mt-8 text-center">
          <button className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition duration-200">
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChallengeOver;
