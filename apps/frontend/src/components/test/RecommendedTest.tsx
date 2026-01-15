import React from 'react';
import { Button } from '@repo/common-ui';
import { Badge } from '@repo/common-ui';
import { Lightbulb } from 'lucide-react';
import MarkdownRenderer from '@/lib/MarkdownRenderer';
import { ExamType } from '@repo/db/enums';

interface RecommendedTestProps {
  testId: string;
  testName: string;
  duration: string;
  difficulty: string;
  examCode: string;
  examType: ExamType
  totalMarks: number;
  totalQuestions: number;
  onStartTest: (testId: string) => void;
}

const RecommendedTest: React.FC<RecommendedTestProps> = ({
  testId,
  testName,
  duration,
  difficulty,
  examCode,
  examType,
  totalMarks,
  totalQuestions,
  onStartTest,
}) => {
  const examLabel = examCode === 'JEE' ? 'JEE Aspirants' : examCode === 'NEET' ? 'NEET Aspirants' : 'Aspirants';
  const diffLabel = difficulty?.charAt(0)?.toUpperCase() + difficulty?.slice(1)?.toLowerCase();

  const examTypeCopy: Record<string, string> = {
    FULL_LENGTH: 'Full Mock to simulate real exam pressure.',
    SUBJECT_WISE: 'Perfect if you’re focusing on mastering a subject.',
    CHAPTER_WISE: 'Nail down your weak chapters with laser precision.',
    ONBOARDING: 'A smart way to start your journey.',
    CUSTOM: 'Tailored just for your current needs.',
    PYQ: 'Based on real previous years’ questions.',
    SPEED_TEST: 'Designed to boost your solving speed under time crunch.',
    WEAKNESS_BASED: 'Built to fix your mistakes and raise accuracy.',
    ADAPTIVE: 'Smart test that adapts to your level in real time.',
    DAILY_CHALLENGE: 'Today’s most important challenge. Don’t skip.',
    SIMULATION: 'Closest experience to your actual exam day.',
  };

  const hookLines: Record<string, string> = {
    FULL_LENGTH: 'Think you’re ready for the real thing?',
    SUBJECT_WISE: 'Ready to master this subject?',
    CHAPTER_WISE: 'Your chapter clarity starts here.',
    ONBOARDING: 'Let’s kick off with a test that maps your level.',
    CUSTOM: 'Your journey, your test.',
    PYQ: 'See where you stand against real exam trends.',
    SPEED_TEST: 'Tick tock. Can you beat the clock?',
    WEAKNESS_BASED: 'Turn weak zones into your strength.',
    ADAPTIVE: 'A test that adjusts to challenge you.',
    DAILY_CHALLENGE: 'Challenge your skills today — rise daily.',
    SIMULATION: 'Dress rehearsal for your exam day.',
  };

  const hook = hookLines[examType] || 'Ready for a breakthrough?';
  const whyItMatters = examTypeCopy[examType] || 'Designed to improve your prep.';
  const stats = `${totalQuestions} Qs • ${duration} min • ${totalMarks} marks`;

  const copy = `**${hook}** ${testName} is a ${diffLabel} level test for ${examLabel}. ${whyItMatters} ${stats}.`;

  return (
    <div className="bg-primary-50 rounded-lg p-2 md:p-4 border border-primary-100 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="text-primary-500">
            <Lightbulb size={24} className="mt-1" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-primary-900 mb-1">Recommended Test for You</h2>
            <p className="text-sm text-primary-700 whitespace-pre-line">
              <MarkdownRenderer content={copy} className="text-sm" />
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline" className="bg-primary-100 text-primary-700 border-primary-200">{duration} Min</Badge>
              <Badge variant="outline" className="bg-primary-100 text-primary-700 border-primary-200">{diffLabel}</Badge>
              <Badge variant="outline" className="bg-primary-100 text-primary-700 border-primary-200">{examLabel}</Badge>
            </div>
          </div>
        </div>
        <Button
          className="bg-primary-600 hover:bg-primary-700 text-white whitespace-nowrap rounded-full"
          onClick={() => onStartTest(testId)}
        >
          Start Recommended Test
        </Button>
      </div>
    </div>
  );
};

export default RecommendedTest;
