---
description: Planning agent workflow for structured task management — enforces requirements, design, tasks, and workflow document consistency
---

# Planning Agent Workflow

> Use this workflow when approaching ANY development task on the BetMax project.

## Pre-Task Checklist

// turbo-all

Before writing any code, always perform these checks:

1. **Read the current project documents** to understand existing state:
   - `docs/requirements.md` — Check if the feature/fix already has a requirement
   - `docs/design.md` — Check if there is an existing design for this area
   - `docs/tasks.md` — Check current completion stage for related tasks
   - `docs/workflow.md` — Review process rules and stage definitions

2. **Identify the site section** this task belongs to:
   - Homepage, Live Events, Sports Betting, Arbitrage Scanner
   - Stats Hub, Streaming & Scrapers, Events & Sports Detail
   - Layout & Navigation, Non-Functional

3. **Verify traceability** — does this task have:
   - [ ] A requirement (REQ-XX-N) in `requirements.md`?
   - [ ] A design reference in `design.md`?
   - [ ] A task entry (TASK-XX-N) in `tasks.md`?

4. **If any are missing**, create them BEFORE starting implementation:
   - Add requirement → `docs/requirements.md`
   - Add design spec → `docs/design.md`
   - Add task entry → `docs/tasks.md`
   - Initial stage: ⬜ 1 (Defined)

## During Implementation

5. **Update task stage** as work progresses:
   - Stage 1 (⬜ Defined) → 2 (🟡 Designed) when design is written
   - Stage 2 → 3 (🟢 Implemented) when code is written
   - Stage 3 → 4 (✅ Verified) when tested and working
   - Stage 4 → 5 (🚀 Complete) when production-ready

6. **Write code** following the design specification

7. **Test the implementation** — verify it meets acceptance criteria from `requirements.md`

## Post-Task Checklist

8. **Update all four documents**:
   - `docs/tasks.md` — Update stage for completed tasks
   - `docs/tasks.md` — Update summary table at bottom
   - `docs/design.md` — Update if implementation differed from original design
   - `docs/workflow.md` — Update if process changed

9. **Run verification** for the affected section:
   - Requirement exists? ✓
   - Design maps to requirement? ✓
   - Task entry exists? ✓
   - Implementation matches design? ✓
   - Stage accurately assigned? ✓

10. **Flag any issues** using standard flags:
    - `[MISSING-REQ]` — Code without requirement
    - `[MISSING-DESIGN]` — Requirement without design
    - `[MISSING-TASK]` — Design without task
    - `[BROKEN]` — Implemented but not working
    - `[REGRESSION]` — Was working, now broken
    - `[ORPHANED]` — Code with no traceability

## Stage Definitions

| Stage | Symbol | Meaning |
|-------|--------|---------|
| 1 | ⬜ | Defined — Requirement written |
| 2 | 🟡 | Designed — Technical design completed |
| 3 | 🟢 | Implemented — Code written |
| 4 | ✅ | Verified — Tested & working |
| 5 | 🚀 | Complete — Production-ready & stable |

## Quick Reference

- **docs/requirements.md** → What to build (REQ IDs)
- **docs/design.md** → How to build it (architecture, components, data models)
- **docs/tasks.md** → Track progress (TASK IDs, stages)
- **docs/workflow.md** → Process rules (stages, change management)

## Status Report

After completing a significant batch of work, generate a status report following the template in `docs/workflow.md` §6.
