# Cursor Agent Rulebook  
## File Structure & Naming Conventions (MANDATORY)

> These rules are **non-negotiable**.  
> The Cursor Agent must behave like a **senior FAANG architect** and **refuse** to create files or folders that violate these rules.

---

## 1. Core Architecture Principles

### Rule 1.1 — Domain-Driven Structure
File and folder structure MUST represent **business domains**, not frameworks or technical layers.

- ❌ `/components`, `/utils`, `/helpers`
- ✅ `/practice-session`, `/mastery-engine`, `/coach-agent`

If a folder cannot be mapped to a real-world domain, **do not create it**.

---

### Rule 1.2 — Predictability First
A developer must be able to **guess the file path without searching**.

If the agent is unsure about the correct path → **STOP and ask for clarification**.

---

### Rule 1.3 — One Responsibility Rule
Each folder and file must have **exactly one responsibility**.

If a name requires `and`, split it.

---

## 2. Global Naming Conventions

### Rule 2.1 — Folder Naming
- Use **kebab-case**
- Use **singular nouns**
- Use **domain language**

```
practice-session/
mastery-engine/
question-selection/
coach-agent/
```

---

### Rule 2.2 — File Naming
- Use **kebab-case**
- Be **explicit**
- No abbreviations

```
generate-daily-session.usecase.ts
build-next-14-day-plan.usecase.ts
```

---

## 3. Monorepo Root Structure (Fixed)

```
apps/
  frontend/
  backend/

packages/
  db/
  algorithms/
  shared-types/
  config/
```

---

## 4. Backend Structure

```
backend/
  src/
    modules/
    api/
    infrastructure/
    jobs/
    config/
```

---

## 5. Module Architecture (Golden Rule)

```
modules/<domain>/
  domain/
  application/
  infrastructure/
  api/
  index.ts
```

---

## 6. Domain Layer Rules

Pure business logic only.  
No frameworks, no databases, no HTTP.

---

## 7. Application Layer Rules

One file = one use case.  
No DB queries. No controllers.

---

## 8. Infrastructure Layer Rules

Adapters only.  
Repositories, gateways, datasources.

---

## 9. API Layer Rules

Controllers and routes only.  
No business logic.

---

## 10. Coach Agent Structure

```
modules/coach-agent/
  domain/
  application/
  infrastructure/
  api/
```

---

## 11. Algorithms Package

```
packages/algorithms/
  mastery/
  selection/
  psychology/
```

---

## 12. Database Package

```
packages/db/
  schema/
  migrations/
  repositories/
```

---

## 13. Shared Types

Types only. No logic.

---

## 14. Forbidden Structures (Auto-Reject)

- utils
- helpers
- common
- misc
- temp

---

## 15. Index File Contract

Expose only public APIs.  
No deep imports.

---

## 16. Auto-Refactor Rule

If a folder exceeds 7 files → split by sub-domain.

---

## 17. File Creation Gate

If unsure about domain or responsibility → DO NOT CREATE.

---

## 18. Quality Bar

File name must explain intent without opening.

---

## 19. Enforcement

Architecture quality > speed.

Violation = rejection.
