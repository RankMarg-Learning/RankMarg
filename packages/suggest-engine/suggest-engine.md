# RankMarg Daily Suggestion Engine  
## Cursor Agent – Implementation Artifact (Build-Ready)

---

## 0. System Intent (Non-Negotiable)

- Suggestions feel like **chat messages from a coach**
- Communication is **one-direction only**
- No LLM conversation loop
- Suggestions are:
  - Generated once per day (at 00:30)
  - Streamed via **SSE**
  - Read-only for the student
- Logic is deterministic + AI phrasing

- Check the @schema.prisma file for the database schema
- You can integrate with Practice Session Generator mention the codebase
- Remaimber that @enums.ts file has the enums used in the database , add more enums if needed
- All right code optimized, structure is good and scalable
- My vision is to make this suggestion current rule base for day to day coaching and analysis
- Objective is make this has AI coach for students like human coach 


Example of how coach will show their suggestion like below sample (this is not final UI):
- Hi Aniket,

first chat : Today, focus on below topics:

second chat: yesterday practice summary with study suggestion

third chat : Subject 1: Topic 1 (10 Questions) : SubTopic 1 , SubTopic 2 ... more (action button with url to start practice) 

fourth chat : Subject 2: Topic 2 (10 Questions) : SubTopic 1 , SubTopic 2 ... more (action button with url to start practice)

fifth chat : Subject 3: Topic 3 (10 Questions) : SubTopic 1 , SubTopic 2 ... more (action button with url to start practice)

sixth chat: If student solve all questions from all this sessions then give feedback like response 

sixth chat : analyze the today session and suggest current topic to practice if he has time 



- Above like response I wanted to give to student not same but like that with different tones and styles 


## Focus things will building this suggestion engine:
1. Allign with Curriculum
2. Allign with Exam Phase
3. Allign with Exam Weightage
4. Motivation
5. Subject Wise proper guidance
6. Accuracy based suggestion
7. Time based suggestion
8. If student skip practice session 
9. Add more important things 


## Action Button:
- Action button should be like 
1. For Daily practice session - "Start Practice" and url should be "https://www.rankmarg.in/ai-session/[sessionId]"
2. For More Practice for one topic - "Practice More" and url should be "https://www.rankmarg.in/ai-questions/[subjectId]/[topicSlug]"
3. For See Mastery - "See Mastery" and url should be "https://www.rankmarg.in/mastery/[subjectId]"
4. For suggest any Mock Test - "Mock Test" and url should be "https://www.rankmarg.in/tests"
5. For Analysis the Mock Test - "Mock Test Analysis" and url should be "https://www.rankmarg.in/t/[testId]/analysis"
6. For change or manage the curriculum - "Change Curriculum" and url should be "https://www.rankmarg.in/my-curriculum"
7. If student is free then tell them to analysis their old practice session and url should be "https://www.rankmarg.in/ai-practice/recent-results"

