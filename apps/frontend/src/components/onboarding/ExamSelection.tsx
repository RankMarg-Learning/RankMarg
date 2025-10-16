import React from 'react';
import { cn } from '@/lib/utils';
import useOnboardingStore from '@/store/onboardingStore';
import { Card, CardContent } from '@/components/ui/card';
import Motion from '@/components/ui/motion';
import OnboardingLayout from './OnboardingLayout';
import { useExams } from '@/hooks/useExams';
import { Skeleton } from '../ui/skeleton';

const ExamSelection: React.FC = () => {
	const { examCode, setExamCode } = useOnboardingStore();
	const { exams, isLoading } = useExams();
	const handleSelectExam = (selectedExamCode: string) => {
		setExamCode(selectedExamCode);
	};

	const activeExams = (exams || []).filter((exam) => exam.isActive);

	return (
		<OnboardingLayout
			title="Select Your Exam"
			subtitle="Choose the exam you are preparing for"
			nextDisabled={!examCode}
		>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
				{ isLoading ? (
					<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
						{Array.from({ length: 2 }).map((_, i) => (
							<Skeleton key={i} className="h-[64px] w-full rounded-xl" />
						))}
					</div>
				) : activeExams.map((exam, index) => (
					<Motion
						key={exam.code}
						animation="scale-in"
						delay={150 + index * 50}
						className="w-full"
					>
						<Card
							className={cn(
								"border-2 cursor-pointer transition-all duration-200 hover:shadow-md h-full",
								examCode === exam.code
									? "border-primary ring-1 ring-primary/20 bg-primary/5"
									: "border-border hover:border-primary/30"
							)}
							onClick={() => handleSelectExam(exam.code)}
						>
							<CardContent className="p-4">
								<div className="flex items-start gap-3">
									<div className="flex-1">
										<h3 className="text-lg font-semibold">{exam.name}</h3>
										<p className="text-muted-foreground text-sm mt-1">{exam.description}</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</Motion>
				))}
			</div>
		</OnboardingLayout>
	);
};

export default ExamSelection;