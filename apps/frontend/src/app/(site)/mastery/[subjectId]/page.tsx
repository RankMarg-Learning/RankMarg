import MasterySubjectPage from '@/components/mastery/MasterySubjectPage';
import React from 'react'


const MasterySubject = ({ params }: { params: { subjectId: string } }) => {
    const { subjectId } = params
  return (
    <MasterySubjectPage subjectId={subjectId} />
  )
}

export default MasterySubject