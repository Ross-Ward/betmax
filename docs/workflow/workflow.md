# BetMax — Development Workflow

> **Version**: 1.0  
> **Last Updated**: 2026-02-14  
> **Purpose**: Governs how changes propagate between project documents and ensures consistency

---

## 1. Completion Stages

| Stage | Symbol | Meaning | Criteria |
|-------|--------|---------|----------|
| 1 | ⬜ | **Defined** | Requirement written in `docs/requirements.md` |
| 2 | 🟡 | **Designed** | Technical design completed in `docs/design.md`, mapped to REQ IDs |
| 3 | 🟢 | **Implemented** | Code written, compiles, basic manual check done |
| 4 | ✅ | **Verified** | Tested & working correctly, edge cases handled |
| 5 | 🚀 | **Complete** | Production-ready, stable, documented |

### Stage Interpretation
- ❌ **Not implemented** → Stage 1–2
- ⚠ **Implemented but broken** → Stage 3
- ✅ **Implemented & verified** → Stage 4
- 🚀 **Fully complete** → Stage 5

---

## 2. Document Update Rules

### Adding a New Feature
When a new feature is requested, follow this **exact order**:

```
1. docs/requirements.md  → Add REQ-{SECTION}-{N} with acceptance criteria
2. docs/design.md        → Add technical design referencing the REQ ID
3. docs/tasks.md         → Generate TASK-{SECTION}-{N} entries
4. docs/workflow.md      → Update if process changes are needed
5. Assign Stage 1   → All new entries start at Stage 1 (Defined)
```

### Promoting a Stage
```
Stage 1 → 2:  Design document updated with technical specification
Stage 2 → 3:  Code implemented, PR-ready
Stage 3 → 4:  Tests pass, manual verification complete
Stage 4 → 5:  Deployed, stable for 1+ cycle, documentation updated
```

### Demoting a Stage
If a verified feature breaks:
```
Stage 4 → 3:  Mark as 🟢 (Implemented but broken), note the regression
Stage 3 → 2:  If the implementation approach needs redesign
```

---

## 3. Change Management Rules

### Mandatory Traceability
Every implementation MUST have:
- ✅ A requirement in `docs/requirements.md`
- ✅ A design reference in `docs/design.md`
- ✅ A task entry in `docs/tasks.md`

### Prohibited States
- ❌ Code without a requirement = **Orphaned Code** → Must add REQ or remove code
- ❌ Task without design mapping = **Undesigned Work** → Must add design
- ❌ Design without requirement = **Speculative Design** → Must add REQ or remove

### Flagging Issues
When reviewing, flag these explicitly:
```
[MISSING-REQ]     → Implementation exists without requirement
[MISSING-DESIGN]  → Requirement exists without design
[MISSING-TASK]    → Design exists without task
[BROKEN]          → Implemented but not working
[REGRESSION]      → Was working, now broken
[ORPHANED]        → Code exists with no traceability
```

---

## 4. Section-Based Verification Checklist

For **each site section**, verify:

| # | Check | Status |
|---|-------|--------|
| 1 | Requirement exists in `docs/requirements.md` | |
| 2 | Design maps to requirement in `docs/design.md` | |
| 3 | Task entry exists in `docs/tasks.md` | |
| 4 | Implementation matches design | |
| 5 | Stage is accurately assigned (1–5) | |

### Section Status Template
```markdown
### [Section Name]
- Requirements: X/Y documented
- Design: X/Y mapped
- Tasks: X/Y created
- Implementation: X/Y coded
- Verification: X/Y tested
- Overall Stage: [1-5]
- Issues: [list any flags]
```

---

## 5. Review Process

### Before Any PR/Commit
1. Run verification checklist for affected sections
2. Confirm no orphaned code
3. Update stage ratings in `tasks.md`
4. Update summary table at bottom of `tasks.md`

### Weekly Review
1. Review all sections for stage accuracy
2. Identify bottlenecks (sections stuck at Stage 2–3)
3. Flag regressions
4. Update `requirements.md` if business rules changed
5. Generate status report

---

## 6. Status Report Format

When generating a status report, use this structure:

```markdown
# BetMax Status Report — [Date]

## Summary
- Total tasks: X
- Complete (🚀): X
- Verified (✅): X
- Implemented (🟢): X
- Designed (🟡): X
- Defined (⬜): X

## Section Breakdown
| Section | Stage | Issues |
|---------|-------|--------|
| ... | ... | ... |

## Flags
- [FLAG] Description

## Recommended Next Actions
1. ...
2. ...
3. ...
```

---

## 7. File Locations

| File | Path | Purpose |
|------|------|---------|
| Requirements | `docs/requirements.md` | What to build |
| Design | `docs/design.md` | How to build it |
| Tasks | `docs/tasks.md` | Track progress |
| Workflow | `docs/workflow.md` | Process rules |

---

## 8. Agent Workflow Integration

This workflow is enforced by the planning agent defined in `.agent/workflows/planning-agent.md`. When the agent approaches any task, it must:

1. **Check** `requirements.md` for existing coverage
2. **Check** `design.md` for technical specification
3. **Check** `tasks.md` for implementation status
4. **Follow** this `workflow.md` for process rules
5. **Update** all four documents as changes are made
