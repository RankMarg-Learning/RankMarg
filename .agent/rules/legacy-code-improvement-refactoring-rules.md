---
trigger: manual
---

# RankMarg IDE Agent – Legacy Code Improvement & Refactoring Rules
Version: 1.0
Mission: Upgrade old code to FAANG-grade quality without regressions

---

## 0. Refactor Prime Directive

### rule-refactor-without-regression
The agent must **never break existing behavior** while improving code.

Rules:
- External behavior must remain identical
- APIs must remain backward-compatible
- Database migrations must be reversible
- Feature flags must guard risky changes

Refactoring is **invisible to users but obvious to engineers**.

---

## 1. Change Classification Rules

### rule-classify-change-before-action
Every change must be classified before implementation.

Change types:
- Structural (folder, module, layer)
- Behavioral (logic change)
- Performance (speed/memory)
- Readability (naming, clarity)
- Safety (null checks, guards)

Rules:
- Never mix change types in one PR
- Structural refactors first
- Behavioral refactors last
- One intent per change set

---

## 2. Baseline Protection Rules

### rule-freeze-current-behavior
Before refactoring, freeze current behavior.

Rules:
- Capture inputs → outputs
- Log side effects
- Snapshot DB writes
- Write characterization tests if missing

If behavior is unclear → **observe first, refactor later**.

---

### rule-tests-before-refactor
If no tests exist, write **minimal safety tests**.

Rules:
- Test what the code does, not what it should do
- Avoid refactoring logic while writing tests
- Use golden-file / snapshot tests when possible

---

## 3. Code Smell Detection Rules

### rule-identify-high-risk-smells
The agent must actively scan for these smells:

Critical smells:
- God functions (>100 lines)
- Mixed concerns in same function
- Hidden global state
- Implicit side effects
- Temporal coupling (order-dependent logic)

If detected → mandatory refactor.

---

### rule-name-smells-are-design-smells
Bad names indicate broken design.

Rules:
- Variables like `data`, `temp`, `result`, `obj` are illegal
- Function names must answer: *what business action is happening*
- Rename first, refactor second

---

## 4. Incremental Refactoring Rules

### rule-strangle-not-rewrite
Legacy code must be **strangled**, not rewritten.

Rules:
- Wrap old logic with new interfaces
- Route new behavior through new code
- Gradually deprecate old paths
- Delete only after full traffic migration

---

### rule-small-steps-only
Refactoring must move in small, reversible steps.

Rules:
- One extraction at a time
- One rename at a time
- One dependency inversion at a time
- Commit frequently

---

## 5. Function-Level Improvement Rules

### rule-extract-until-obvious
If a function needs comments → extract logic instead.

Rules:
- Each function expresses one idea
- Extract decision logic
- Extract calculations
- Extract IO separately

---

### rule-make-state-explicit
Hidden state must be surfaced.

Rules:
- Pass dependencies as parameters
- Eliminate reliance on globals
- Replace implicit flags with explicit state objects

---

## 6. Layer & Boundary Rules

### rule-push-logic-downward
Business logic must move downward in the stack.

Rules:
- Controllers lose logic first
- UI becomes declarative
- Domain becomes expressive
- Infra becomes replaceable

---

### rule-invert-dependencies
High-level logic must not depend on low-level details.

Rules:
- Use interfaces/ports
- Inject DB, cache, queues
- No direct imports of infra in domain

---

## 7. Data & Schema Refactoring Rules

### rule-expand-and-contract
Schema changes must follow expand–contract pattern.

Steps:
1. Add new columns/tables
2. Write to both old and new
3. Migrate reads
4. Remove old fields later

Rules:
- No destructive migration in one step
- Backward compatibility mandatory

---

### rule-data-derivation-is-repeatable
Derived data must always be reproducible.

Rules:
- Never store irreversible aggregates
- Keep raw events
- Version derived logic
- Allow backfills

---

## 8. Performance Refactoring Rules

### rule-measure-before-optimizing
Never optimize blindly.

Rules:
- Measure latency
- Measure query cost
- Measure memory
- Measure impact under load

---

### rule-cache-last
Caching is the last optimization step.

Rules:
- Fix algorithms first
- Fix data access patterns
- Cache only stable outputs
- Cache invalidation must be explicit

---

## 9. Error Handling Refactoring Rules

### rule-make-errors-first-class
Errors are part of the API contract.

Rules:
- Replace silent failures
- Replace boolean returns with typed errors
- Add context to errors
- Map domain errors explicitly to UI

---

## 10. Comment & Documentation Rules

### rule-delete-comments-by-refactor
Comments that explain *how* indicate bad code.

Rules:
- Replace comments with better structure
- Keep comments only for *why*
- Delete outdated comments aggressively

---

## 11. Consistency & Style Rules

### rule-make-style-uniform
Consistency beats personal preference.

Rules:
- One naming convention
- One error-handling pattern
- One async pattern
- One folder strategy

Legacy inconsistency must be normalized.

---

## 12. Risk Containment Rules

### rule-feature-flag-dangerous-changes
Any risky refactor must be guarded.

Rules:
- Feature flags for behavior changes
- Gradual rollout
- Instant rollback capability

---

### rule-observability-after-refactor
Refactored code must be more observable than before.

Rules:
- Add structured logs
- Add metrics
- Add tracing points
- Validate production behavior

---

## 13. Deletion Rules

### rule-delete-code-ruthlessly
Dead code is technical debt.

Rules:
- If unused → delete
- If duplicated → consolidate
- If unclear → isolate then delete
- Smaller codebase is safer codebase

---

## 14. Refactor Completion Criteria

### rule-refactor-done-definition
A refactor is complete only if:

- Code is shorter OR clearer
- Dependencies are fewer
- Behavior is unchanged
- Tests pass
- Future change is easier

If none improve → refactor failed.

---

## 15. Agent Self-Check Rules

### rule-agent-must-justify-change
For every refactor, the agent must answer:

- What smell existed?
- What rule triggered?
- What improved?
- What risk remains?

No justification → no merge.

---

## Final Refactor Oath

### rule-refactor-oath
The agent must:
- Respect legacy reality
- Improve structure before behavior
- Optimize for future engineers
- Leave code better than it was found

Refactoring is **engineering leadership in action**.

---
