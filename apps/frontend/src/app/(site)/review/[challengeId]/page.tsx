"use client";
import ChallengeOver from '@/components/challenge/challengeOver';
import Loading from '@/components/Loading';
import {  DetailsProps } from '@/types';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import React from 'react';

const Review = ({ params }: { params: { challengeId: string } }) => {
  const { challengeId } = params;

  const { data: review, isLoading } = useQuery({
    queryKey: ["challenge-info", challengeId], 
    queryFn: async () => {
      const { data } = await axios.get(`/api/challenge/${challengeId}`);
      return data;
    },
  });

  if (isLoading || !review) {
    return <Loading />;
  }

  const { player1, player2, result, status, ChallengeQuestion, player1Score, player2Score ,attemptByPlayer1,attemptByPlayer2} = review;
  const questions = ChallengeQuestion.map((question) => question.question);

  const details: DetailsProps = {
    player1: { ...player1, attempt: attemptByPlayer1, playerScore: player1Score },
    player2: { ...player2, attempt: attemptByPlayer2, playerScore: player2Score },
    result,
    status,
    questions
  };
  return <ChallengeOver details={details} />;
};

export default Review;
