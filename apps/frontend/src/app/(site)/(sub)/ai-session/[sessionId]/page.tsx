import AiPracticeSession from '@/components/AiPracticeSession';
import { Metadata } from 'next';
import React from 'react'

export async function generateMetadata({ params }: { params: { sessionId: string } }): Promise<Metadata> {
    return {
        title: `AI Practice Session - ${params.sessionId} | RankMarg`,
        description: `Practice session for ${params.sessionId} | RankMarg`,
    };
}

const PracticeSessionPage = ({ params }: { params: { sessionId: string } }) => {
    return (
        <AiPracticeSession sessionId={params.sessionId} />
    )
}

export default PracticeSessionPage