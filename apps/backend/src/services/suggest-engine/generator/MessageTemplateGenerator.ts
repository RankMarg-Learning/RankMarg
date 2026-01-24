import { CoachMood } from "../types/extended.types";

interface StudyPromptTemplate {
    emoji: string;
    header: string;
    topicsLabel: string;
    tip: string;
}

interface PracticePromptTemplate {
    emoji: string;
    intro: string;
    detailsLabel: string;
    motivational: string;
}

export class MessageTemplateGenerator {

    getStudyPromptTemplate(
        subjectName: string,
        mood: CoachMood,
        sessionNumber: number
    ): StudyPromptTemplate {
        const templates: StudyPromptTemplate[] = [
            {
                emoji: mood === "celebratory" ? "🎯" : mood === "encouraging" ? "💪" : "📚",
                header: `**${subjectName} - Session ${sessionNumber}**`,
                topicsLabel: "📖 **Topics to Study:**",
                tip: "💡 **Pro Tip:** Study these topics for 10-15 minutes before solving. It'll boost your confidence! 🚀"
            },
            {
                emoji: mood === "celebratory" ? "🔥" : mood === "encouraging" ? "✨" : "📝",
                header: `**Let's master ${subjectName} today!**`,
                topicsLabel: `📚 **Focus Areas for Session ${sessionNumber}:**`,
                tip: "✨ **Coach's Advice:** Quick revision of concepts before attempting questions leads to better accuracy!"
            },
            {
                emoji: mood === "celebratory" ? "⚡" : mood === "encouraging" ? "🌟" : "🎓",
                header: `**${subjectName} Practice - Round ${sessionNumber}**`,
                topicsLabel: "🎯 **Key Topics:**",
                tip: "🧠 **Smart Strategy:** Understanding beats memorization. Spend time on concepts first!"
            },
            {
                emoji: mood === "celebratory" ? "💫" : mood === "encouraging" ? "🚀" : "📖",
                header: `**${subjectName} Session ${sessionNumber}**`,
                topicsLabel: "📌 **What you'll learn:**",
                tip: "⚡ **Quick Tip:** A quick theory revision now saves time during problem-solving later!"
            },
            {
                emoji: mood === "celebratory" ? "🏆" : mood === "encouraging" ? "💡" : "✍️",
                header: `**Time to strengthen ${subjectName}!**`,
                topicsLabel: "🔍 **Study these topics first:**",
                tip: "🎯 **Expert Advice:** Strong fundamentals = Faster problem solving. Review concepts thoroughly!"
            },
            {
                emoji: mood === "celebratory" ? "🎊" : mood === "encouraging" ? "💪" : "📚",
                header: `**${subjectName} - Session ${sessionNumber} begins!**`,
                topicsLabel: "📝 **Today's learning targets:**",
                tip: "🌟 **Top Tip:** Read theory once, solve confidently. Give concepts 10 minutes of focus!"
            },
            {
                emoji: mood === "celebratory" ? "✅" : mood === "encouraging" ? "🔥" : "📊",
                header: `**Ready for ${subjectName}? Session ${sessionNumber}**`,
                topicsLabel: "🎓 **Concepts to understand:**",
                tip: "💡 **Remember:** Every expert was once a beginner. Start with the basics, then dive into questions!"
            },
            {
                emoji: mood === "celebratory" ? "🌟" : mood === "encouraging" ? "⚡" : "🧠",
                header: `**${subjectName} Mastery - Session ${sessionNumber}**`,
                topicsLabel: "🔑 **Core concepts to review:**",
                tip: "🚀 **Winning Strategy:** Theory → Practice → Perfection. Begin with a quick concept refresh!"
            }
        ];

        return this.selectRandomTemplate(templates);
    }

    /**
     * Get a random practice prompt template
     */
    getPracticePromptTemplate(
        subjectName: string,
        mood: CoachMood,
        sessionNumber: number
    ): PracticePromptTemplate {
        const templates: PracticePromptTemplate[] = [
            {
                emoji: mood === "celebratory" ? "🔥" : mood === "encouraging" ? "💪" : "✅",
                intro: `**Ready to Practice ${subjectName}?**`,
                detailsLabel: "📊 **Session Details:**",
                motivational: mood === "celebratory"
                    ? "🎉 You're on fire! Let's crush this practice session! 💪"
                    : mood === "encouraging"
                        ? "🌟 You've got this! Consistent practice = Top rank! 🎯"
                        : "🚀 Let's make today count. Start solving now! 💡"
            },
            {
                emoji: mood === "celebratory" ? "⚡" : mood === "encouraging" ? "🎯" : "📝",
                intro: `**Time to solve ${subjectName} questions!**`,
                detailsLabel: "🎯 **What's ahead:**",
                motivational: mood === "celebratory"
                    ? "🏆 Your hard work is paying off! Keep the momentum going! 🔥"
                    : mood === "encouraging"
                        ? "💪 Every question solved brings you closer to your goal! Let's do this! ⚡"
                        : "✨ Focus and precision. That's all you need! Begin now! 🚀"
            },
            {
                emoji: mood === "celebratory" ? "🎯" : mood === "encouraging" ? "🚀" : "🧠",
                intro: `**${subjectName} Problem Solving Session**`,
                detailsLabel: "📋 **Session Overview:**",
                motivational: mood === "celebratory"
                    ? "💫 Excellent progress! Time to show what you've learned! 🎊"
                    : mood === "encouraging"
                        ? "🎯 Believe in your preparation. You're ready for this! 💡"
                        : "📚 Smart work beats hard work. Let's solve systematically! ✅"
            },
            {
                emoji: mood === "celebratory" ? "💫" : mood === "encouraging" ? "✨" : "⚡",
                intro: `**Let's ace ${subjectName} practice!**`,
                detailsLabel: "🔖 **Quick Stats:**",
                motivational: mood === "celebratory"
                    ? "🌟 You're crushing it! This session will be amazing too! 🔥"
                    : mood === "encouraging"
                        ? "🚀 Practice makes perfect, and you're doing great! Keep going! 💪"
                        : "⚡ Quick. Focused. Accurate. That's the winning formula! 🎯"
            },
            {
                emoji: mood === "celebratory" ? "🏆" : mood === "encouraging" ? "💡" : "✍️",
                intro: `**${subjectName} Session ${sessionNumber} - Practice Time!**`,
                detailsLabel: "📌 **Session Info:**",
                motivational: mood === "celebratory"
                    ? "🎉 Your dedication is inspiring! Let's nail this session! ⚡"
                    : mood === "encouraging"
                        ? "🌟 Trust your preparation. One question at a time! 🎯"
                        : "🧠 Apply what you've studied. Time to practice! 🚀"
            },
            {
                emoji: mood === "celebratory" ? "✅" : mood === "encouraging" ? "🔥" : "📊",
                intro: `**Start your ${subjectName} practice now!**`,
                detailsLabel: "ℹ️ **Practice Details:**",
                motivational: mood === "celebratory"
                    ? "🔥 On a winning streak! Let's keep it going strong! 💪"
                    : mood === "encouraging"
                        ? "💡 You're making progress every day. Keep practicing! ✨"
                        : "📈 Consistency is key. Let's solve these questions! ⚡"
            },
            {
                emoji: mood === "celebratory" ? "🎊" : mood === "encouraging" ? "⚡" : "🎓",
                intro: `**${subjectName} - Time to practice!**`,
                detailsLabel: "📝 **What to expect:**",
                motivational: mood === "celebratory"
                    ? "💫 Riding high on success! This session will be great too! 🎯"
                    : mood === "encouraging"
                        ? "🔥 Challenge yourself and grow! You've got this! 💪"
                        : "🎯 Speed + Accuracy = Success. Let's begin! 🚀"
            },
            {
                emoji: mood === "celebratory" ? "🌟" : mood === "encouraging" ? "💪" : "🔍",
                intro: `**Solve ${subjectName} - Session ${sessionNumber}**`,
                detailsLabel: "🎯 **Session Breakdown:**",
                motivational: mood === "celebratory"
                    ? "⚡ Amazing work so far! Let's add to your success! 🏆"
                    : mood === "encouraging"
                        ? "🚀 Each practice session makes you stronger! Start now! 💡"
                        : "✅ Focused practice leads to top ranks. Let's go! 🔥"
            }
        ];

        return this.selectRandomTemplate(templates);
    }


    getNoYesterdayPracticeMessage(): string {
        const messages = [
            "No practice yesterday? No worries! Every day is a fresh start. Let's begin today with focused practice. 💪",
            "Missed practice yesterday? It happens to the best of us! Let's get back on track today and crush those goals. 🎯",
            "Yesterday is gone, but today is full of potential. Let's make up for it with an extra focused session! 🚀",
            "Consistency is a journey, not a destination. One missed day won't stop you! Ready to dive back in? 🔥",
            "Don't let yesterday take up too much of today. Reset and restart—you've got this! ✨",
            "Taking a break is part of the process, but now it's time to build momentum again! Let's go! ⚡"
        ];

        return this.selectRandomTemplate(messages);
    }

    private selectRandomTemplate<T>(templates: T[]): T {
        const randomIndex = Math.floor(Math.random() * templates.length);
        return templates[randomIndex];
    }
}
