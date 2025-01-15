import { AnalysisSectionC, SectioncQuestionTiming, SectionCTiming, TestWithIncludes } from "@/types/typeTest";
import { Stream } from "@prisma/client";



export const SectionC = (test: TestWithIncludes): AnalysisSectionC => {
    // Initialize section timings based on stream
    const sectionTimings: SectionCTiming[] = test.test.stream === Stream.JEE 
        ? [
            { name: "Physics", totalTime: 0, maxTime: 60 },
            { name: "Chemistry", totalTime: 0, maxTime: 60 },
            { name: "Mathematics", totalTime: 0, maxTime: 60 }
          ]
        : [
            { name: "Physics", totalTime: 0, maxTime: 60 },
            { name: "Chemistry", totalTime: 0, maxTime: 60 },
            { name: "Biology", totalTime: 0, maxTime: 60 }
          ];

    const questionTimings: SectioncQuestionTiming[] = [];

    // Process each submission
    test.TestSubmission.forEach((submission, index) => {
        const questionNumber = `Q${index + 1}`;
        const timing = submission.timing || 0;
        const subject = submission.Question.subject.toLowerCase();

        // Add to section total
        const sectionIndex = sectionTimings.findIndex(
            section => section.name.toLowerCase() === subject
        );
        if (sectionIndex !== -1) {
            sectionTimings[sectionIndex].totalTime += timing;
        }

        // Initialize question timing based on stream
        const questionTiming: SectioncQuestionTiming = test.test.stream === Stream.JEE 
            ? {
                question: questionNumber,
                physics: 0,
                chemistry: 0,
                mathematics: 0
              }
            : {
                question: questionNumber,
                physics: 0,
                chemistry: 0,
                biology: 0
            };

        // Add timing to appropriate subject
        switch (subject) {
            case 'mathematics':
                if (test.test.stream === Stream.JEE) {
                    questionTiming.mathematics = timing;
                }
                break;
            case 'biology':
                if (test.test.stream === Stream.NEET) {
                    questionTiming.biology = timing;
                }
                break;
            case 'physics':
                questionTiming.physics = timing;
                break;
            case 'chemistry':
                questionTiming.chemistry = timing;
                break;
        }

        questionTimings.push(questionTiming);
    });

    return {
        sectionTimings,
        questionTimings
    };
};

export default SectionC;
