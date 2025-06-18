export const RuleBook = {
  categories: [
    {
      name: "Mastery",
      description:
        "Focuses on improving subject proficiency and addressing weak areas.",
      triggers: ["DAILY_CHECK", "POST_PRACTICE", "POST_TEST", "WEEKLY_SUMMARY"],
      rules: [
        {
          priority: 10,
          condition: {
            type: "accuracy",
            period: "daily",
            operator: "lt",
            value: 40,
          },
          action:
            "Your accuracy yesterday was below 40% in {subject}. Revisit core concepts or seek help from a tutor.",
          suggestionType: "WARNING",
          duration: 2,
          triggers: ["DAILY_CHECK"],
        },
        {
          priority: 11,
          condition: {
            type: "accuracy",
            period: "3-day",
            operator: "lt",
            value: 60,
            consecutive: true,
          },
          action:
            "Accuracy below 60% for 3 days in {subject}. Try video tutorials or group study to strengthen understanding.",
          suggestionType: "GUIDANCE",
          duration: 3,
          triggers: ["DAILY_CHECK", "POST_PRACTICE"],
        },
        {
          priority: 13,
          condition: {
            type: "accuracy",
            period: "daily",
            operator: "gte",
            value: 90,
          },
          action:
            "Fantastic! Accuracy above 90% in {subject} yesterday. Tackle advanced questions to deepen mastery.",
          suggestionType: "CELEBRATION",
          duration: 1,
          triggers: ["DAILY_CHECK", "POST_PRACTICE"],
        },
        {
          priority: 15,
          condition: {
            type: "extreme_change",
            metric: "accuracy",
            period: "daily",
            change: "drop",
            threshold: 30,
          },
          action:
            "Big accuracy drop in {subject} yesterday! Review errors and focus on weak subtopics.",
          suggestionType: "WARNING",
          duration: 2,
          triggers: ["DAILY_CHECK", "POST_PRACTICE", "REAL_TIME"],
        },
      ],
    },
    {
      name: "Streak",
      description:
        "Encourages consistent engagement through daily streaks and habit-building.",
      triggers: ["DAILY_CHECK", "STREAK_MILESTONE", "REAL_TIME"],
      rules: [
        {
          priority: 20,
          condition: {
            type: "streak",
            activity: "questions_solved",
            days: 3,
            consecutive: true,
            min_count: 5,
          },
          action:
            "3-day streak of solving 5+ questions daily! Your consistency is building a strong foundation.",
          suggestionType: "ENCOURAGEMENT",
          duration: 1,
          triggers: ["STREAK_MILESTONE", "DAILY_CHECK"],
        },
        {
          priority: 21,
          condition: {
            type: "streak",
            activity: "questions_solved",
            days: 7,
            consecutive: true,
            min_count: 5,
          },
          action:
            "7-day streak of solving questions! You're unstoppable—keep this momentum going!",
          suggestionType: "CELEBRATION",
          duration: 2,
          triggers: ["STREAK_MILESTONE"],
        },
        {
          priority: 22,
          condition: {
            type: "streak_broken",
            activity: "questions_solved",
            days: 1,
          },
          action:
            "Missed solving questions yesterday? Start a new streak today with a few easy ones.",
          suggestionType: "REMINDER",
          duration: 1,
          triggers: ["DAILY_CHECK", "INACTIVITY"],
        },
      ],
    },
    {
      name: "Test",
      description:
        "Guides students through test preparation and performance analysis.",
      triggers: ["POST_TEST", "DAILY_CHECK", "WEEKLY_SUMMARY"],
      rules: [
        {
          priority: 1,
          condition: {
            type: "date",
            condition: "is_one_day_before_exam",
          },
          action:
            "Exam tomorrow! Stay calm, review key notes, and get plenty of rest.",
          suggestionType: "REMINDER",
          duration: 1,
          triggers: ["DAILY_CHECK"],
        },
        {
          priority: 3,
          condition: {
            type: "test_performance",
            period: "latest",
            operator: "lt",
            value: 60,
          },
          action:
            "Your latest test score was below 60%. Analyze errors and practice similar questions.",
          suggestionType: "GUIDANCE",
          duration: 3,
          triggers: ["POST_TEST"],
        },
        {
          priority: 4,
          condition: {
            type: "test_performance",
            period: "latest",
            operator: "gte",
            value: 80,
          },
          action:
            "Awesome! Scored above 80% on your latest test. Aim for a top rank in the next one!",
          suggestionType: "CELEBRATION",
          duration: 2,
          triggers: ["POST_TEST"],
        },
      ],
    },
    {
      name: "General",
      description:
        "Addresses daily study habits, time management, and overall academic wellness.",
      triggers: ["DAILY_CHECK", "WEEKLY_SUMMARY", "MONTHLY_REVIEW"],
      rules: [
        {
          priority: 30,
          condition: {
            type: "study_time",
            period: "daily",
            operator: "lt",
            value: 1,
          },
          action:
            "Studied less than 1 hour yesterday? Aim for 2 hours today to build momentum.",
          suggestionType: "REMINDER",
          duration: 1,
          triggers: ["DAILY_CHECK"],
        },
        {
          priority: 31,
          condition: {
            type: "study_time",
            period: "weekly",
            operator: "gt",
            value: 20,
          },
          action:
            "Over 20 hours of study last week! Great effort—take breaks to stay sharp.",
          suggestionType: "ENCOURAGEMENT",
          duration: 2,
          triggers: ["WEEKLY_SUMMARY"],
        },
        {
          priority: 35,
          condition: {
            type: "new_user",
            days_active: "lt",
            value: 3,
          },
          action:
            "Welcome! Set a small goal and solve a few questions today to start strong.",
          suggestionType: "GUIDANCE",
          duration: 3,
          triggers: ["DAILY_CHECK"],
        },
      ],
    },
    {
      name: "Motivation",
      description:
        "Boosts morale, encourages resilience, and celebrates progress.",
      triggers: [
        "INACTIVITY",
        "DAILY_CHECK",
        "WEEKLY_SUMMARY",
        "MONTHLY_REVIEW",
      ],
      rules: [
        {
          priority: 40,
          condition: {
            type: "inactivity",
            days: 3,
            consecutive: true,
          },
          action:
            "Haven't seen you in 3 days! Your goals are waiting—start with one small task today.",
          suggestionType: "MOTIVATION",
          duration: 2,
          triggers: ["INACTIVITY"],
        },
        {
          priority: 43,
          condition: {
            type: "score_trend",
            period: "weekly",
            trend: "improving",
          },
          action:
            "Your scores are up this week! Your hard work is paying off—keep it going!",
          suggestionType: "CELEBRATION",
          duration: 2,
          triggers: ["WEEKLY_SUMMARY"],
        },
        {
          priority: 47,
          condition: {
            type: "date",
            condition: "is_first_day_of_month",
          },
          action:
            "New month, new opportunities! Reflect on last month and set bold goals for this one.",
          suggestionType: "MOTIVATION",
          duration: 1,
          triggers: ["MONTHLY_REVIEW"],
        },
      ],
    },
  ],
};
