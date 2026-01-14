
# RankMarg Coach Agent  
## Full Rules, Plan & Implementation Blueprint (NEET / JEE)

---

## 1. PURPOSE & PHILOSOPHY

The RankMarg Coach is a **strategic, periodic, AI-powered mentor** designed to:
- Analyze the **last 14 days of student performance**
- Compare it with **previous mastery snapshots**
- Understand the **current study phase & exam proximity**
- Deliver **clear guidance, risk signals, and a 14-day roadmap**

### Core Philosophy
- ❌ Not a chatbot  
- ❌ Not reactive feedback  
- ✅ A decision intelligence layer for students  
- ✅ LLM = reasoning & communication, not analytics

---

## 2. HARD RULES (NON-NEGOTIABLE)

1. Analytics First, LLM Last  
2. Time-Boxed Reasoning (14-day windows only)  
3. Frozen Mastery Snapshots  
4. Deterministic Study Phase  
5. Actionability > Motivation  

---

## 3. SYSTEM ARCHITECTURE

Practice Engine → Telemetry → Analytics Engine → Coach Orchestrator → LLM → Coach Report → UI

---

## 4. DATA MODELS

### Attempt Telemetry
- user_id
- question_id
- subject
- topic
- difficulty
- is_correct
- time_spent
- error_type
- attempted_at

### Mastery Snapshot
- snapshot_date
- subject
- topic
- mastery_score
- confidence
- decay_risk

### Performance Window (14D)
- accuracy
- avg_time
- speed_index
- error_breakdown

---

## 5. ANALYTICS ENGINE

### Mastery Delta Rules
- +0.05 → Improvement
- -0.05 → Regression

### Risk Flags
- Avoidance
- Burnout
- False Confidence
- Knowledge Decay

---

## 6. COACH ORCHESTRATOR

- Validates data
- Enforces rules
- Controls LLM calls
- Merges agent outputs

---

## 7. ROADMAP RULES

- 14-day horizon
- Phase-based constraints
- Max 2 weak subjects/day
- No new topics in revision phase

---

## 8. IMPLEMENTATION PHASES

Phase 1: Data & Snapshots  
Phase 2: Analytics & Risk Engine  
Phase 3: LLM Coach & UI  

---

## 9. FINAL NOTE

This system transforms RankMarg into a **digital performance coach**, not a content platform.
