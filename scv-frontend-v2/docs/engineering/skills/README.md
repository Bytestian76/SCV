# Engineering Skills

This folder stores project-level engineering playbooks used during day-to-day development.

## Why this location
- `docs/` keeps non-runtime assets out of production code paths.
- `engineering/` separates developer process docs from product/functional docs.
- `skills/` groups reusable behavior templates for coding sessions and reviews.

## Current skills
- `git-workflow.md`: branch strategy, commit/PR standards, and team metrics.
- `mentor-style.md`: mentoring/explanation style for learning-first sessions.

## Usage
1. Read the relevant skill before starting implementation.
2. Follow the start protocol and pre-commit protocol defined in the skill.
3. Open PRs from working branch to `develop`.

## Branch policy for skill changes
- Create a branch from `develop` (example: `feature/docs-skills-guidelines`).
- Commit docs changes in small logical commits.
- Push branch and open PR to `develop`.
- Merge to `main` only through release flow.
