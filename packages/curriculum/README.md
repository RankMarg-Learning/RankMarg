# @repo/curriculum

Shared source of truth for multi-exam curricula (JEE, NEET, CUET, etc.) that can be consumed by every RankMarg app (Next.js frontends, the admin panel, backend services, scripts, etc.).

## Contents

- Type-safe definitions for exams, subjects, units, and topics.
- Canonical data for the most-requested exams (`JEE_MAIN`, `NEET_UG`, `CUET_SCI`).
- Helper utilities to look up exams, list subjects, or search for topics by tags/difficulty.

## Usage

Install/build once at the workspace root:

```bash
npm run build --workspace=packages/curriculum
```

### Frontend / Admin (Next.js)

```ts
import { listExamCurricula, searchTopics } from "@repo/curriculum";

const exams = listExamCurricula();
const jeeTopics = searchTopics({ examCode: "JEE_MAIN", tags: ["calculus"] });
```

### Backend (Express / services)

```ts
import { getSubjectTopics } from "@repo/curriculum";

const physicsTopics = getSubjectTopics("NEET_UG", "PHYSICS");
```

All apps already have the `@repo/curriculum` path alias wired up, so you can import from source without worrying about relative paths. Build artifacts are emitted to `packages/curriculum/dist` for production bundles.

