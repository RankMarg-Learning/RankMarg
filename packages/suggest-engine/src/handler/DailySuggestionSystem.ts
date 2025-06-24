import { SuggestionType } from "@prisma/client";
import { SuggestionHandler } from "../types";
import prisma from "../lib/prisma";
import {
  AttemptWithQuestionDetails,
  MistakeAnalysis,
  PerformanceMetrics,
  StreakData,
  SubjectMap,
  SubjectPerformance,
  SuggestionConfig,
  TopicMap,
  TopicPerformance,
} from "../types/daily.types";

export class DailySuggestionSystem implements SuggestionHandler {
  async generate(userId: string): Promise<void> {
    try {
      const yesterdayMetrics =
        await this.getYesterdayPerformanceMetrics(userId);

      if (!yesterdayMetrics) {
        await this.handleNoActivitySuggestion(userId);
        return;
      }
      console.log(
        `Generating daily suggestions for user ${userId} based on yesterday's metrics`
      );
      const allSuggestions = await this.analyzePerfomanceAndCreateSuggestions(
        userId,
        yesterdayMetrics
      );

      const topSuggestions = allSuggestions
        .filter((s) => s.suggestions.length > 0)
        .sort((a, b) => a.priority - b.priority)
        .slice(0, 3);

      await this.storeSuggestions(topSuggestions);

      console.log(
        `Generated ${topSuggestions.length} top priority suggestions for user ${userId} (from ${allSuggestions.length} total suggestions)`
      );
    } catch (error) {
      console.error("Error generating daily suggestions:", error);
      throw error;
    }
  }

  private async getYesterdayPerformanceMetrics(
    userId: string
  ): Promise<PerformanceMetrics | null> {
    const IST_OFFSET_MINUTES = 5.5 * 60;

    const today = new Date();
    today.setUTCMinutes(today.getUTCMinutes() - IST_OFFSET_MINUTES);
    today.setUTCHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setUTCDate(today.getUTCDate() - 1);

    const attempts: AttemptWithQuestionDetails[] =
      await prisma.attempt.findMany({
        where: {
          userId,
          solvedAt: {
            gte: yesterday,
            lt: today,
          },
        },
        include: {
          question: {
            include: {
              subject: true,
              topic: true,
              subTopic: true,
            },
          },
        },
      });

    if (attempts.length === 0) {
      return null;
    }

    const totalQuestions = attempts.length;
    const correctAnswers = attempts.filter(
      (a) => a.status === "CORRECT"
    ).length;
    const accuracy = (correctAnswers / totalQuestions) * 100;
    const averageTime =
      attempts.reduce((sum, a) => sum + (a.timing || 0), 0) / totalQuestions;
    const hintsUsed = attempts.filter((a) => a.hintsUsed).length;

    const subjectWisePerformance =
      this.calculateSubjectWisePerformance(attempts);
    const topicWisePerformance = await this.calculateTopicWisePerformance(
      userId,
      attempts
    );
    const mistakeAnalysis = this.analyzeMistakes(attempts);
    const streakData = this.calculateStreakData(attempts);

    return {
      totalQuestions,
      correctAnswers,
      accuracy,
      averageTime,
      hintsUsed,
      subjectWisePerformance,
      topicWisePerformance,
      mistakeAnalysis,
      streakData,
    };
  }

  private calculateSubjectWisePerformance(
    attempts: AttemptWithQuestionDetails[]
  ): SubjectPerformance[] {
    const subjectMap = new Map<string, SubjectMap>();

    attempts.forEach((attempt) => {
      if (!attempt.question.subject) return;

      const subjectId = attempt.question.subject.id;
      const subjectName = attempt.question.subject.name;

      if (!subjectMap.has(subjectId)) {
        subjectMap.set(subjectId, {
          subjectId,
          subjectName,
          correct: 0,
          total: 0,
          totalTime: 0,
        });
      }

      const subject = subjectMap.get(subjectId)!;
      subject.total++;
      if (attempt.status === "CORRECT") subject.correct++;
      subject.totalTime += attempt.timing || 0;
    });

    return Array.from(subjectMap.values()).map((subject) => ({
      subjectId: subject.subjectId,
      subjectName: subject.subjectName,
      accuracy: (subject.correct / subject.total) * 100,
      questionsAttempted: subject.total,
      averageTime: subject.totalTime / subject.total,
    }));
  }

  private async calculateTopicWisePerformance(
    userId: string,
    attempts: AttemptWithQuestionDetails[]
  ): Promise<TopicPerformance[]> {
    const topicMap = new Map<string, TopicMap>();

    attempts.forEach((attempt) => {
      if (!attempt.question.topic) return;

      const topicId = attempt.question.topic.id;
      const topicName = attempt.question.topic.name;
      const subjectName = attempt.question.subject?.name || "Unknown";

      if (!topicMap.has(topicId)) {
        topicMap.set(topicId, {
          topicId,
          topicName,
          subjectName,
          correct: 0,
          total: 0,
        });
      }

      const topic = topicMap.get(topicId)!;
      topic.total++;
      if (attempt.status === "CORRECT") topic.correct++;
    });

    const topicIds = Array.from(topicMap.keys());
    const masteryData = await prisma.topicMastery.findMany({
      where: {
        userId,
        topicId: { in: topicIds },
      },
    });

    const masteryMap = new Map(masteryData.map((m) => [m.topicId, m]));

    return Array.from(topicMap.values()).map((topic) => {
      const mastery = masteryMap.get(topic.topicId);
      return {
        topicId: topic.topicId,
        topicName: topic.topicName,
        subjectName: topic.subjectName,
        accuracy: (topic.correct / topic.total) * 100,
        questionsAttempted: topic.total,
        masteryLevel: mastery?.masteryLevel || 0,
        strengthIndex: mastery?.strengthIndex || 0,
      };
    });
  }

  private analyzeMistakes(
    attempts: AttemptWithQuestionDetails[]
  ): MistakeAnalysis {
    const mistakes = {
      conceptual: 0,
      calculation: 0,
      reading: 0,
      overconfidence: 0,
      other: 0,
    };

    attempts.forEach((attempt) => {
      if (
        attempt.status !== "CORRECT" &&
        attempt.mistake &&
        attempt.mistake !== "NONE"
      ) {
        const mistakeType = attempt.mistake.toLowerCase();
        if (mistakes.hasOwnProperty(mistakeType)) {
          mistakes[mistakeType as keyof MistakeAnalysis]++;
        } else {
          mistakes.other++;
        }
      }
    });

    return mistakes;
  }

  private calculateStreakData(
    attempts: AttemptWithQuestionDetails[]
  ): StreakData {
    let currentStreak = 0;
    let maxCorrectStreak = 0;
    let maxWrongStreak = 0;
    let tempCorrectStreak = 0;
    let tempWrongStreak = 0;

    const sortedAttempts = attempts.sort(
      (a, b) => new Date(a.solvedAt).getTime() - new Date(b.solvedAt).getTime()
    );

    sortedAttempts.forEach((attempt, index) => {
      const isCorrect = attempt.status === "CORRECT";

      if (isCorrect) {
        tempCorrectStreak++;
        tempWrongStreak = 0;
        maxCorrectStreak = Math.max(maxCorrectStreak, tempCorrectStreak);
      } else {
        tempWrongStreak++;
        tempCorrectStreak = 0;
        maxWrongStreak = Math.max(maxWrongStreak, tempWrongStreak);
      }

      if (index === sortedAttempts.length - 1) {
        currentStreak = isCorrect ? tempCorrectStreak : -tempWrongStreak;
      }
    });

    return {
      currentStreak,
      maxCorrectStreak,
      maxWrongStreak,
    };
  }

  private async handleNoActivitySuggestion(userId: string): Promise<void> {
    const noActivityTemplates = [
      "📚 No practice yesterday? No problem—every day’s a fresh start to grow!",
      "You took a break yesterday. Let’s get back on track today!",
      "No activity yesterday. Time to kick things off and make progress!",
    ];
    const suggestions: SuggestionConfig[] = [
      this.createSuggestionConfig(
        userId,
        "MOTIVATION",
        4,
        noActivityTemplates,
        {},
        "Start Practice",
        "/ai-practice"
      ),
    ];
    await this.storeSuggestions(suggestions);
  }

  private async analyzePerfomanceAndCreateSuggestions(
    userId: string,
    metrics: PerformanceMetrics
  ): Promise<SuggestionConfig[]> {
    const suggestions: SuggestionConfig[] = [];

    suggestions.push(
      ...(await this.analyzeOverallPerformance(userId, metrics))
    );
    suggestions.push(
      ...(await this.analyzeSubjectPerformance(userId, metrics))
    );
    suggestions.push(...(await this.analyzeTopicPerformance(userId, metrics)));
    suggestions.push(...(await this.analyzeTimeManagement(userId, metrics)));
    suggestions.push(...(await this.analyzeMistakePatterns(userId, metrics)));
    suggestions.push(...(await this.analyzeStreakPerformance(userId, metrics)));
    suggestions.push(
      ...(await this.generateStudyStrategySuggestions(userId, metrics))
    );

    return suggestions.filter((s) => s.suggestions.length > 0);
  }

  private async analyzeOverallPerformance(
    userId: string,
    metrics: PerformanceMetrics
  ): Promise<SuggestionConfig[]> {
    const suggestions: SuggestionConfig[] = [];

    if (metrics.accuracy >= 85) {
      const templates = [
        "🎉 Outstanding effort! You hit {accuracy}% accuracy yesterday—keep that energy alive!",
        "🌟 You’re crushing it with {accuracy}% accuracy. Let’s maintain this winning streak!",
        "👏 Awesome job! {accuracy}% accuracy shows your hard work paying off. Stay the course!",
        "🔥 You nailed {accuracy}% accuracy yesterday. Keep shining, champ!",
      ];
      suggestions.push(
        this.createSuggestionConfig(userId, "PERFORMANCE", 1, templates, {
          accuracy: metrics.accuracy.toFixed(1),
        })
      );
    } else if (metrics.accuracy >= 70) {
      const templates = [
        "👍 Nice work! {accuracy}% accuracy is strong—let’s push for 85% today!",
        "💪 You’re at {accuracy}% accuracy. Solid foundation—let’s build it higher!",
        "🌱 Great progress with {accuracy}% accuracy. Keep growing toward excellence!",
        "👊 {accuracy}% accuracy is a good step. Let’s aim higher together!",
      ];
      suggestions.push(
        this.createSuggestionConfig(userId, "PERFORMANCE", 2, templates, {
          accuracy: metrics.accuracy.toFixed(1),
        })
      );
    } else if (metrics.accuracy >= 50) {
      const templates = [
        "🛠️ You’re at {accuracy}% accuracy. Let’s sharpen those skills together!",
        "📈 {accuracy}% accuracy shows promise. Time to boost it with some focus!",
        "💡 With {accuracy}% accuracy, we’ve got room to grow. Let’s tackle the basics!",
        "🏃‍♂️ {accuracy}% accuracy is a start. Keep moving forward with practice!",
      ];
      suggestions.push(
        this.createSuggestionConfig(
          userId,
          "IMPROVEMENT",
          3,
          templates,
          { accuracy: metrics.accuracy.toFixed(1) },
          "Review Concepts",
          "/study/review"
        )
      );
    } else {
      const templates = [
        "🌟 {accuracy}% accuracy? Every pro started somewhere—let’s build from here!",
        "📚 At {accuracy}% accuracy, we’ve got a chance to learn. Let’s dive into the basics!",
        "💪 Don’t sweat {accuracy}% accuracy—it’s a stepping stone. We’ll climb together!",
        "🏋️‍♂️ {accuracy}% accuracy is your baseline. Let’s power up from here!",
      ];
      suggestions.push(
        this.createSuggestionConfig(
          userId,
          "URGENT_IMPROVEMENT",
          4,
          templates,
          { accuracy: metrics.accuracy.toFixed(1) },
          "Start Basics",
          "/study/basics"
        )
      );
    }

    return suggestions;
  }

  private async analyzeSubjectPerformance(
    userId: string,
    metrics: PerformanceMetrics
  ): Promise<SuggestionConfig[]> {
    const suggestions: SuggestionConfig[] = [];

    const sortedSubjects = metrics.subjectWisePerformance.sort(
      (a, b) => b.accuracy - a.accuracy
    );
    const strongestSubject = sortedSubjects[0];
    const weakestSubject = sortedSubjects[sortedSubjects.length - 1];

    if (strongestSubject && weakestSubject && sortedSubjects.length > 1) {
      const accuracyGap = strongestSubject.accuracy - weakestSubject.accuracy;

      if (accuracyGap > 30) {
        const templates = [
          "📊 Whoa! {strongestSubject} at {strongestAccuracy}% shines, but {weakestSubject} at {weakestAccuracy}% needs some love!",
          "🏋️‍♂️ {strongestSubject} is rocking {strongestAccuracy}%, while {weakestSubject} lags at {weakestAccuracy}%. Let’s balance it out!",
          "🌟 Big contrast! {strongestSubject} at {strongestAccuracy}% vs {weakestSubject} at {weakestAccuracy}%. Time to lift up {weakestSubject}!",
        ];
        suggestions.push(
          this.createSuggestionConfig(
            userId,
            "SUBJECT_BALANCE",
            2,
            templates,
            {
              strongestSubject: strongestSubject.subjectName,
              strongestAccuracy: strongestSubject.accuracy.toFixed(1),
              weakestSubject: weakestSubject.subjectName,
              weakestAccuracy: weakestSubject.accuracy.toFixed(1),
            },
            `Focus on ${weakestSubject.subjectName}`,
            `/study/subject/${weakestSubject.subjectName.toLowerCase()}`
          )
        );
      }
    }

    for (const subject of metrics.subjectWisePerformance) {
      if (subject.accuracy < 40 && subject.questionsAttempted >= 3) {
        const templates = [
          "⚠️ {subjectName} is at {accuracy}%—let’s turn that around with some targeted practice!",
          "📉 {subjectName} hit {accuracy}% accuracy. Time to dig in and boost it up!",
          "🛠️ {subjectName} needs a lift at {accuracy}%. Let’s tackle it together!",
        ];
        suggestions.push(
          this.createSuggestionConfig(
            userId,
            "SUBJECT_IMPROVEMENT",
            3,
            templates,
            {
              subjectName: subject.subjectName,
              accuracy: subject.accuracy.toFixed(1),
            },
            `Study ${subject.subjectName}`,
            `/study/subject/${subject.subjectName.toLowerCase()}`
          )
        );
      }
    }

    return suggestions;
  }

  private async analyzeTopicPerformance(
    userId: string,
    metrics: PerformanceMetrics
  ): Promise<SuggestionConfig[]> {
    const suggestions: SuggestionConfig[] = [];

    const weakTopics = metrics.topicWisePerformance.filter(
      (t) => t.accuracy < 50 && t.questionsAttempted >= 2
    );

    if (weakTopics.length > 0) {
      const topicsList = weakTopics
        .slice(0, 3)
        .map((t) => t.topicName)
        .join(", ");
      const templates = [
        "🎯 Let’s zero in on these weaker spots: {topicsList}. You’ve got this!",
        "📌 Time to strengthen: {topicsList}. Let’s make them your forte!",
        "💪 Your next challenge? Power up on: {topicsList}. I’m rooting for you!",
      ];
      suggestions.push(
        this.createSuggestionConfig(
          userId,
          "TOPIC_FOCUS",
          2,
          templates,
          { topicsList },
          "Practice Weak Topics",
          "/study/weak-topics"
        )
      );
    }

    const improvementTopics = metrics.topicWisePerformance.filter(
      (t) => t.accuracy >= 70 && t.masteryLevel < 50
    );

    if (improvementTopics.length > 0) {
      const templates = [
        "🏆 You’re solid in some topics—more practice will make you unstoppable!",
        "🌟 Looking good in spots! A little more effort, and you’ll master them!",
        "💡 You’ve got the knack in some areas. Let’s polish them to perfection!",
      ];
      suggestions.push(
        this.createSuggestionConfig(
          userId,
          "MASTERY_BUILDING",
          1,
          templates,
          {}
        )
      );
    }

    return suggestions;
  }

  private async analyzeTimeManagement(
    userId: string,
    metrics: PerformanceMetrics
  ): Promise<SuggestionConfig[]> {
    const suggestions: SuggestionConfig[] = [];

    const averageTimePerQuestion = metrics.averageTime;
    const idealTime = 2.5;

    if (averageTimePerQuestion > idealTime * 1.5) {
      const templates = [
        "⏰ {averageTime} min/question? Let’s pick up the pace together!",
        "🏃‍♂️ You’re at {averageTime} min/question. Time to speed things up!",
        "⏳ Averaging {averageTime} min/question—let’s work on efficiency!",
      ];
      suggestions.push(
        this.createSuggestionConfig(
          userId,
          "TIME_MANAGEMENT",
          2,
          templates,
          { averageTime: averageTimePerQuestion.toFixed(1) },
          "Time Management Tips",
          "/tips/time-management"
        )
      );
    } else if (averageTimePerQuestion < idealTime * 0.7) {
      const templates = [
        "⚡ Fast at {averageTime} min/question, but let’s lock in that accuracy too!",
        "🏎️ You’re quick at {averageTime} min/question—now let’s nail the precision!",
        "🌪️ {averageTime} min/question is speedy! Let’s balance it with accuracy!",
      ];
      suggestions.push(
        this.createSuggestionConfig(userId, "ACCURACY_FOCUS", 2, templates, {
          averageTime: averageTimePerQuestion.toFixed(1),
        })
      );
    }

    return suggestions;
  }

  private async analyzeMistakePatterns(
    userId: string,
    metrics: PerformanceMetrics
  ): Promise<SuggestionConfig[]> {
    const suggestions: SuggestionConfig[] = [];

    const totalMistakes = metrics.totalQuestions - metrics.correctAnswers;
    if (totalMistakes === 0) return suggestions;

    const mistakeTypes = metrics.mistakeAnalysis;
    const dominantMistakeType = Object.entries(mistakeTypes)
      .filter(([key]) => key !== "other")
      .reduce((a, b) =>
        mistakeTypes[a[0] as keyof MistakeAnalysis] >
        mistakeTypes[b[0] as keyof MistakeAnalysis]
          ? a
          : b
      );

    if (dominantMistakeType[1] > totalMistakes * 0.4) {
      const mistakeType = dominantMistakeType[0];
      const mistakeTemplates = {
        conceptual: [
          "🧠 {count}/{total} conceptual errors—let’s solidify those core ideas!",
          "📚 Conceptual slips at {count}/{total}. Time to master the fundamentals!",
        ],
        calculation: [
          "🔢 {count}/{total} calc errors—let’s sharpen those number skills!",
          "➗ Calculation missteps at {count}/{total}. Precision practice is key!",
        ],
        reading: [
          "📖 {count}/{total} reading errors—slow down and catch the details!",
          "👀 Reading gotcha’s at {count}/{total}. Let’s focus on comprehension!",
        ],
        overconfidence: [
          "😎 {count}/{total} from overconfidence—double-check those instincts!",
          "🏃‍♂️ Overconfidence tripped you up {count}/{total} times. Stay sharp!",
        ],
      };
      const templates =
        mistakeTemplates[mistakeType as keyof typeof mistakeTemplates] || [];
      if (templates.length > 0) {
        let actionUrl = "";
        switch (mistakeType) {
          case "conceptual":
            actionUrl = "/study/concepts";
            break;
          case "calculation":
            actionUrl = "/practice/calculations";
            break;
          case "reading":
            actionUrl = "/tips/reading-comprehension";
            break;
          case "overconfidence":
            actionUrl = "/tips/avoiding-traps";
            break;
        }
        suggestions.push(
          this.createSuggestionConfig(
            userId,
            "MISTAKE_PATTERN",
            2,
            templates,
            {
              count: dominantMistakeType[1].toString(),
              total: totalMistakes.toString(),
            },
            "Learn More",
            actionUrl
          )
        );
      }
    }

    return suggestions;
  }

  private async analyzeStreakPerformance(
    userId: string,
    metrics: PerformanceMetrics
  ): Promise<SuggestionConfig[]> {
    const suggestions: SuggestionConfig[] = [];

    if (metrics.streakData.maxCorrectStreak >= 5) {
      const templates = [
        "🔥 Wow! A {streak}-question correct streak—you’re unstoppable!",
        "🏆 {streak}-question streak nailed! Keep that fire burning!",
        "🌟 {streak} correct in a row—amazing focus, keep it up!",
      ];
      suggestions.push(
        this.createSuggestionConfig(
          userId,
          "STREAK_CELEBRATION",
          1,
          templates,
          { streak: metrics.streakData.maxCorrectStreak.toString() }
        )
      );
    }

    if (metrics.streakData.maxWrongStreak >= 3) {
      const templates = [
        "📉 {streak} wrong in a row? Shake it off—we’ll get back on track!",
        "🛠️ Tough stretch with {streak} misses. Let’s rebuild that streak!",
        "💪 Hit a {streak}-wrong bump. Time to turn it around together!",
      ];
      suggestions.push(
        this.createSuggestionConfig(userId, "STREAK_RECOVERY", 3, templates, {
          streak: metrics.streakData.maxWrongStreak.toString(),
        })
      );
    }

    return suggestions;
  }

  private async generateStudyStrategySuggestions(
    userId: string,
    metrics: PerformanceMetrics
  ): Promise<SuggestionConfig[]> {
    const suggestions: SuggestionConfig[] = [];

    const hintsPercentage = (metrics.hintsUsed / metrics.totalQuestions) * 100;

    if (hintsPercentage > 50) {
      const templates = [
        "💡 Hints on {percentage}% of questions? Let’s beef up those basics!",
        "🧰 Used hints for {percentage}%—time to deepen your understanding!",
        "📚 {percentage}% hint reliance—let’s work on standing strong solo!",
      ];
      suggestions.push(
        this.createSuggestionConfig(
          userId,
          "STUDY_STRATEGY",
          2,
          templates,
          { percentage: hintsPercentage.toFixed(1) },
          "Build Concepts",
          "/study/concepts"
        )
      );
    } else if (hintsPercentage < 10 && metrics.accuracy < 70) {
      const templates = [
        "🤔 Skipped hints but accuracy’s low—use them to level up!",
        "💪 Low hints, low accuracy? Hints are your friend—lean on them!",
        "📉 Barely used hints and accuracy dipped. Let’s strategize with support!",
      ];
      suggestions.push(
        this.createSuggestionConfig(userId, "STUDY_STRATEGY", 2, templates, {})
      );
    }

    if (metrics.totalQuestions < 5) {
      const templates = [
        "📊 Just {count} questions yesterday? Let’s ramp up the reps!",
        "🏋️‍♂️ {count} attempts yesterday—more practice fuels progress!",
        "🌱 Only {count} questions? Consistency’s your next win—let’s go!",
      ];
      suggestions.push(
        this.createSuggestionConfig(
          userId,
          "VOLUME_INCREASE",
          2,
          templates,
          { count: metrics.totalQuestions.toString() },
          "Set Daily Goal",
          "/settings/daily-goals"
        )
      );
    }

    return suggestions;
  }

  private createSuggestionConfig(
    userId: string,
    category: string,
    priority: number,
    templates: string[],
    data: Record<string, string>,
    actionName?: string,
    actionUrl?: string
  ): SuggestionConfig {
    const selectedTemplate =
      templates[Math.floor(Math.random() * templates.length)];
    const suggestionText = this.formatTemplate(selectedTemplate, data);
    return {
      userId,
      triggerType: "DAILY_ANALYSIS",
      priority,
      category,
      suggestions: [suggestionText],
      actionName,
      actionUrl,
    };
  }

  private formatTemplate(
    template: string,
    data: Record<string, string>
  ): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => data[key] || match);
  }

  private async storeSuggestions(
    suggestions: SuggestionConfig[]
  ): Promise<void> {
    for (const config of suggestions) {
      for (const suggestion of config.suggestions) {
        await prisma.studySuggestion.create({
          data: {
            userId: config.userId,
            type: this.mapCategoryToSuggestionType(config.category),
            triggerType: config.triggerType,
            suggestion,
            category: config.category,
            priority: config.priority,
            actionName: config.actionName,
            actionUrl: config.actionUrl,
            displayUntil: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          },
        });
      }
    }
  }

  private mapCategoryToSuggestionType(category: string): SuggestionType {
    const mapping: { [key: string]: SuggestionType } = {
      PERFORMANCE: "CELEBRATION",
      IMPROVEMENT: "GUIDANCE",
      URGENT_IMPROVEMENT: "WARNING",
      SUBJECT_BALANCE: "GUIDANCE",
      SUBJECT_IMPROVEMENT: "WARNING",
      TOPIC_FOCUS: "GUIDANCE",
      MASTERY_BUILDING: "ENCOURAGEMENT",
      TIME_MANAGEMENT: "GUIDANCE",
      ACCURACY_FOCUS: "GUIDANCE",
      MISTAKE_PATTERN: "WARNING",
      STREAK_CELEBRATION: "CELEBRATION",
      STREAK_RECOVERY: "ENCOURAGEMENT",
      STUDY_STRATEGY: "GUIDANCE",
      VOLUME_INCREASE: "REMINDER",
      MOTIVATION: "MOTIVATION",
    };
    return mapping[category] || "GUIDANCE";
  }
}
