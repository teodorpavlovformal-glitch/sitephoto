# Pavlov Photography Monorepo

This repository now treats the existing Pavlov Photography landing page as one app inside a larger agent-operable workspace.

## Workspace layout

- `apps/site` contains the existing static HTML/CSS/JS marketing site.
- `apps/control-plane` contains the TypeScript control plane for agent runs, approvals, webhook intake, and GitHub/Vercel orchestration.
- `packages/agent-contracts` contains the shared Zod schemas and TypeScript types used by the control plane and workflows.
- `tests/e2e` contains Playwright smoke coverage for the public site.
- `docs/agent` contains architecture, approvals, MCP inventory, and operator setup notes.

## Scripts

- `npm run dev:site` starts the static site locally.
- `npm run dev:control` starts the control-plane HTTP server locally.
- `npm run lint` runs Biome over the repo.
- `npm run test` runs contract and control-plane unit tests.
- `npm run e2e` runs Playwright smoke tests for the site.
- `npm run check` runs lint plus unit tests.
- `npm run agent:dispatch -- --objective "..."` creates a run from the CLI.
- `npm run agent:worker -- --run-id run_...` advances an existing run.

## Environment

Copy `.env.example` to `.env.local` once Node is available and fill in the required secrets:

- `OPENAI_API_KEY` for Responses API planner and review jobs
- `DATABASE_URL` for Postgres-backed run storage
- `GITHUB_TOKEN` for GitHub Actions workflow dispatch
- `GITHUB_WEBHOOK_SECRET` and `VERCEL_WEBHOOK_SECRET` for inbound webhooks

## Deployment

- The existing Vercel site should point at `apps/site`.
- The control plane should be linked as a separate Vercel project rooted at `apps/control-plane`.
- The root `.vercel/project.json` in this workspace still represents the currently linked site project only.
- The canonical GitHub remote should remain `teodorpavlovformal-glitch/newsitelegit` once Git is available locally.

## Note

This machine did not have `node`, `npm`, or a normal Git installation available during the restructure, so the repo was scaffolded without regenerating a new lockfile or running checks locally.
