# AGENTS.md

## Mission

This repository hosts both the public Pavlov Photography site and the control plane that coordinates Codex-driven implementation runs. Any agent working here should preserve the static site while improving the repo's operational maturity.

## Structure

- `apps/site`: customer-facing static site, no framework rewrite in v1
- `apps/control-plane`: TypeScript backend for run intake, planning, approvals, dispatch, and summaries
- `packages/agent-contracts`: shared schemas for requests, plans, approvals, and summaries
- `tests/e2e`: Playwright site smoke tests
- `docs/agent`: operator and architecture documentation

## Risk Gates

The following changes always require explicit approval before execution or merge:

- dependency additions or removals
- secret or environment changes
- auth changes
- schema or data-model changes
- production promotion, merge, or rollback actions

## Tooling Rules

- Package manager: `npm`
- Formatter/linter: `Biome`
- E2E test runner: `Playwright`
- Browser automation: Playwright and Playwright MCP only in v1
- Shared types: Zod schemas from `@pavlov/agent-contracts`

## Operating Rules

- Preserve `apps/site` as static HTML/CSS/JS unless a user explicitly asks for a migration.
- Prefer small, traceable run artifacts and summaries over opaque automation.
- Always attach plan, risk, and QA context to control-plane run records.
- Keep webhook secrets and API keys out of tracked files.
- Treat the root `.vercel/project.json` as the site link only; link the control plane from `apps/control-plane` separately.
