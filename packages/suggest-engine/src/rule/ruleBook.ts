interface Condition {
    type: "accuracy" | "subject_accuracy" | "streak" | "streak_broken" | "test_performance" | "rank_change" | "study_time" | "questions_attempted" | "task_completion" | "score_trend" | "goal_achievement" | "date" | "inactivity" | "new_user" | "extreme_change" | "no_data" | "always";
    period?: "daily" | "3-day" | "weekly" | "latest";
    operator?: "lt" | "gte" | "gt";
    value?: number;
    consecutive?: boolean;
    activity?: "questions_solved" | "study_time";
    days?: number;
    min_count?: number;
    min_hours?: number;
    condition?: "is_one_day_before_exam" | "is_seven_days_before_exam" | "is_first_day_of_month" | "is_monday";
    trend?: "improving" | "declining" | "stable";
    change?: "improved" | "declined" | "drop" | "rise";
    threshold?: number;
    metric?: "accuracy";
    goal_type?: "short-term";
    achieved?: boolean;
    attempted?: boolean;
    days_active?: "lt";
    completed?: boolean;
  }
  
  interface Rule {
    priority: number;
    condition: Condition;
    action: string;
    duration: number;
  }
  
  interface Category {
    name: string;
    description: string;
    rules: Rule[];
  }
  
  interface RuleBook {
    categories: Category[];
  }

export const ruleBook:RuleBook = {
    "categories": [
      {
        "name": "Mastery",
        "description": "Focuses on improving subject proficiency and addressing weak areas.",
        "rules": [
          {
            "priority": 10,
            "condition": {
              "type": "accuracy",
              "period": "daily",
              "operator": "lt",
              "value": 40
            },
            "action": "Your accuracy yesterday was below 40% in [Subject]. Revisit core concepts or seek help from a tutor.",
            "duration": 2
          },
          {
            "priority": 11,
            "condition": {
              "type": "accuracy",
              "period": "3-day",
              "operator": "lt",
              "value": 60,
              "consecutive": true
            },
            "action": "Accuracy below 60% for 3 days in [Subject]. Try video tutorials or group study to strengthen understanding.",
            "duration": 3
          },
          {
            "priority": 12,
            "condition": {
              "type": "subject_accuracy",
              "period": "weekly",
              "operator": "lt",
              "value": 60
            },
            "action": "Your weekly accuracy in [Subject] was below 60%. Focus on targeted practice for this subject.",
            "duration": 3
          },
          {
            "priority": 13,
            "condition": {
              "type": "accuracy",
              "period": "daily",
              "operator": "gte",
              "value": 90
            },
            "action": "Fantastic! Accuracy above 90% in [Subject] yesterday. Tackle advanced questions to deepen mastery.",
            "duration": 1
          },
          {
            "priority": 14,
            "condition": {
              "type": "subject_accuracy",
              "period": "weekly",
              "operator": "gte",
              "value": 85
            },
            "action": "You're excelling in [Subject] with over 85% accuracy this week! Share tips with peers or try advanced topics.",
            "duration": 2
          },
          {
            "priority": 15,
            "condition": {
              "type": "extreme_change",
              "metric": "accuracy",
              "period": "daily",
              "change": "drop",
              "threshold": 30
            },
            "action": "Big accuracy drop in [Subject] yesterday! Review errors and focus on weak subtopics.",
            "duration": 2
          }
        ]
      },
      {
        "name": "Streak",
        "description": "Encourages consistent engagement through daily streaks and habit-building.",
        "rules": [
          {
            "priority": 20,
            "condition": {
              "type": "streak",
              "activity": "questions_solved",
              "days": 3,
              "consecutive": true,
              "min_count": 5
            },
            "action": "3-day streak of solving 5+ questions daily! Your consistency is building a strong foundation.",
            "duration": 1
          },
          {
            "priority": 21,
            "condition": {
              "type": "streak",
              "activity": "questions_solved",
              "days": 7,
              "consecutive": true,
              "min_count": 5
            },
            "action": "7-day streak of solving questions! You're unstoppable—keep this momentum going!",
            "duration": 2
          },
          {
            "priority": 22,
            "condition": {
              "type": "streak_broken",
              "activity": "questions_solved",
              "days": 1
            },
            "action": "Missed solving questions yesterday? Start a new streak today with a few easy ones.",
            "duration": 1
          },
          {
            "priority": 23,
            "condition": {
              "type": "streak",
              "activity": "study_time",
              "days": 5,
              "consecutive": true,
              "min_hours": 2
            },
            "action": "5 days of studying 2+ hours daily! Your dedication is inspiring—keep it up!",
            "duration": 2
          },
          {
            "priority": 24,
            "condition": {
              "type": "streak_broken",
              "activity": "study_time",
              "days": 1,
              "min_hours": 1
            },
            "action": "Studied less than 1 hour yesterday? Restart your streak with 2 hours today.",
            "duration": 1
          }
        ]
      },
      {
        "name": "Test",
        "description": "Guides students through test preparation and performance analysis.",
        "rules": [
          {
            "priority": 1,
            "condition": {
              "type": "date",
              "condition": "is_one_day_before_exam"
            },
            "action": "Exam tomorrow! Stay calm, review key notes, and get plenty of rest.",
            "duration": 1
          },
          {
            "priority": 2,
            "condition": {
              "type": "date",
              "condition": "is_seven_days_before_exam"
            },
            "action": "One week until your exam! Prioritize mock tests and revise weak areas.",
            "duration": 1
          },
          {
            "priority": 3,
            "condition": {
              "type": "test_performance",
              "period": "latest",
              "operator": "lt",
              "value": 60
            },
            "action": "Your latest test score was below 60%. Analyze errors and practice similar questions.",
            "duration": 3
          },
          {
            "priority": 4,
            "condition": {
              "type": "test_performance",
              "period": "latest",
              "operator": "gte",
              "value": 80
            },
            "action": "Awesome! Scored above 80% on your latest test. Aim for a top rank in the next one!",
            "duration": 2
          },
          {
            "priority": 5,
            "condition": {
              "type": "rank_change",
              "change": "declined"
            },
            "action": "Your rank dropped. Don't worry—review mistakes and focus on consistency to climb back up.",
            "duration": 3
          },
          {
            "priority": 6,
            "condition": {
              "type": "rank_change",
              "change": "improved"
            },
            "action": "Rank improved! You're moving up—keep pushing to reach the top!",
            "duration": 2
          }
        ]
      },
      {
        "name": "General",
        "description": "Addresses daily study habits, time management, and overall academic wellness.",
        "rules": [
          {
            "priority": 30,
            "condition": {
              "type": "study_time",
              "period": "daily",
              "operator": "lt",
              "value": 1
            },
            "action": "Studied less than 1 hour yesterday? Aim for 2 hours today to build momentum.",
            "duration": 1
          },
          {
            "priority": 31,
            "condition": {
              "type": "study_time",
              "period": "weekly",
              "operator": "gt",
              "value": 20
            },
            "action": "Over 20 hours of study last week! Great effort—take breaks to stay sharp.",
            "duration": 2
          },
          {
            "priority": 32,
            "condition": {
              "type": "questions_attempted",
              "period": "daily",
              "attempted": false
            },
            "action": "No questions attempted yesterday? Try a few easy ones today to get back on track.",
            "duration": 1
          },
          {
            "priority": 33,
            "condition": {
              "type": "task_completion",
              "period": "daily",
              "completed": false
            },
            "action": "Missed some tasks yesterday? Catch up today to stay organized and on target.",
            "duration": 1
          },
          {
            "priority": 34,
            "condition": {
              "type": "task_completion",
              "period": "daily",
              "completed": true
            },
            "action": "All tasks completed yesterday! Your discipline is paving the way to success.",
            "duration": 1
          },
          {
            "priority": 35,
            "condition": {
              "type": "new_user",
              "days_active": "lt",
              "value": 3
            },
            "action": "Welcome! Set a small goal and solve a few questions today to start strong.",
            "duration": 3
          }
        ]
      },
      {
        "name": "Motivation",
        "description": "Boosts morale, encourages resilience, and celebrates progress.",
        "rules": [
          {
            "priority": 40,
            "condition": {
              "type": "inactivity",
              "days": 3,
              "consecutive": true
            },
            "action": "Haven't seen you in 3 days! Your goals are waiting—start with one small task today.",
            "duration": 2
          },
          {
            "priority": 41,
            "condition": {
              "type": "inactivity",
              "days": 7,
              "consecutive": true
            },
            "action": "You've been away for a week! Jump back in with a small step—you've got this!",
            "duration": 3
          },
          {
            "priority": 42,
            "condition": {
              "type": "score_trend",
              "period": "3-day",
              "trend": "declining"
            },
            "action": "Scores dipped over 3 days? Every setback is a chance to grow—try a new study method.",
            "duration": 2
          },
          {
            "priority": 43,
            "condition": {
              "type": "score_trend",
              "period": "weekly",
              "trend": "improving"
            },
            "action": "Your scores are up this week! Your hard work is paying off—keep it going!",
            "duration": 2
          },
          {
            "priority": 44,
            "condition": {
              "type": "goal_achievement",
              "goal_type": "short-term",
              "achieved": true
            },
            "action": "Short-term goal achieved! Amazing work—set a new target to keep climbing!",
            "duration": 2
          },
          {
            "priority": 45,
            "condition": {
              "type": "goal_achievement",
              "goal_type": "short-term",
              "achieved": false
            },
            "action": "Missed a goal? That's okay! Adjust your plan and keep pushing—you're closer than you think.",
            "duration": 2
          },
          {
            "priority": 46,
            "condition": {
              "type": "score_trend",
              "period": "3-day",
              "trend": "stable"
            },
            "action": "Scores stable over 3 days. Steady progress is great—now aim to push higher!",
            "duration": 2
          },
          {
            "priority": 47,
            "condition": {
              "type": "date",
              "condition": "is_first_day_of_month"
            },
            "action": "New month, new opportunities! Reflect on last month and set bold goals for this one.",
            "duration": 1
          },
          {
            "priority": 48,
            "condition": {
              "type": "date",
              "condition": "is_monday"
            },
            "action": "Happy Monday! Plan your week and set small targets to build confidence.",
            "duration": 1
          },
          {
            "priority": 49,
            "condition": {
              "type": "no_data",
              "period": "daily"
            },
            "action": "No activity recorded yesterday? Start fresh today with a small task to get moving!",
            "duration": 1
          },
          {
            "priority": 100,
            "condition": {
              "type": "always"
            },
            "action": "Daily boost: 'Success is the sum of small efforts, repeated daily.' Keep shining!",
            "duration": 1
          }
        ]
      }
    ]
  }