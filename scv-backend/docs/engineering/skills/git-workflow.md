# Skill: git-workflow

# Enterprise Git Workflow (Solo + Team-Ready)

## Objective
Apply a professional development workflow for this project in every coding session.
The workflow must stay compatible with solo development now, and team collaboration later.

## Core Rules
- Never commit directly to `main`.
- Prefer short-lived branches and small, focused commits.
- Every code change must have a clear intent and a target branch.
- Before coding and before committing, explain exactly what will be uploaded and where.

## Branch Model
- `main`: production-ready code only.
- `develop`: integration branch for validated changes.
- `feature/<scope>-<short-name>`: new functionality or enhancement.
- `fix/<scope>-<short-name>`: non-urgent bug fixes.
- `hotfix/<scope>-<short-name>`: urgent production fix (branch from `main`).
- `chore/<scope>-<short-name>`: maintenance, tooling, refactors without feature impact.

## Session Start Protocol (Mandatory)
Before implementing code, always communicate:
1. What will be built/fixed.
2. Which branch will be used.
3. What files/components are expected to change.
4. How success will be validated (tests, lint, manual checks).

Use this exact format:

```
Development plan
- Scope: <task summary>
- Base branch: <main|develop>
- Working branch: <branch name>
- Expected changes: <files/modules>
- Validation: <tests/checks>
```

## Commit Protocol (Mandatory)
Before creating any commit, always communicate:
1. Exact files staged for commit.
2. Why these changes belong together.
3. Commit message that will be used.
4. Target branch that receives the commit.

Use this exact format:

```
Pre-commit summary
- Branch: <current branch>
- Files to commit: <file list>
- Why: <intent and impact>
- Commit message: <conventional commit>
```

## Commit Standards
Use Conventional Commits:
- `feat:` new functionality
- `fix:` bug fix
- `refactor:` internal code improvement
- `test:` tests
- `docs:` documentation
- `chore:` maintenance/tooling

Keep commits small:
- One logical change per commit.
- Avoid mixing refactor + feature + formatting in one commit.

## Pull Request Standards
Always open PRs from working branch into `develop` (or `main` for hotfix).

PR must include:
- What changed.
- Why it changed.
- Risks and rollback plan.
- Validation evidence (tests or manual verification).
- Screenshots for UI changes.

## Metrics to Track (Team-grade)

### DORA (primary)
- Deployment Frequency
- Lead Time for Changes
- Change Failure Rate
- Mean Time To Recovery (MTTR)

### Flow and Review
- PR size (prefer small PRs)
- Time to first review
- PR cycle time (open to merge)
- Rework rate (requested changes)
- CI pass rate

## Practical Thresholds
- PR size: prefer < 300 net lines when possible.
- First review: target < 24h.
- PR cycle time: target 1-3 days for normal tasks.
- CI pass rate: target > 90%.

## Solo Mode (Current Project)
Even when working alone, simulate team quality:
- Create branch per task.
- Use PR flow (self-review checklist before merge).
- Keep `develop` as integration, `main` as production.
- Merge to `main` only when feature is verified.

## End-of-Task Protocol
After implementation, always provide:
1. What was implemented.
2. What was validated.
3. What will be committed now.
4. To which branch and next PR target.

Use this exact format:

```
Delivery summary
- Implemented: <short bullets>
- Validated: <tests/checks>
- Commit now: <yes/no + files>
- Branch flow: <source branch> -> <target branch>
```

## Non-Negotiables
- Do not skip branch naming conventions.
- Do not push unreviewed changes to `main`.
- Do not create large mixed commits.
- Do not finish a task without explicit pre-commit summary.
