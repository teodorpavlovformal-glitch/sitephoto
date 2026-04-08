# Agent Architecture

## Current shape

- `apps/site` remains a static HTML, CSS, and JavaScript site.
- `apps/control-plane` owns run intake, planning, approvals, workflow dispatch, preview tracking, and summaries.
- `packages/agent-contracts` is the shared contract layer for requests, plans, approvals, steps, artifacts, and summaries.

## Run flow

`Trigger -> Planner -> Approval Gate -> Codex Execution Job -> Browser QA -> Review/Security -> Summary`

- `Trigger` records source metadata and initializes a run.
- `Planner` uses deterministic planning by default and upgrades to Responses API background planning when `OPENAI_API_KEY` is present.
- `Approval Gate` materializes required approvals from risk gates and stops the run until they are approved.
- `Codex Execution Job` dispatches the configured GitHub Actions workflow when `GITHUB_TOKEN` is available.
- `Browser QA` records the preview target and hands off Playwright work to the workflow/test layer.
- `Review/Security` summarizes approval state, preview readiness, and operational blockers.
- `Summary` writes the run summary and next actions back into storage.

## Storage

The control plane persists state in Postgres tables:

- `agent_runs`
- `agent_steps`
- `artifacts`
- `approvals`

If `DATABASE_URL` is missing, the control plane falls back to an in-memory store for local development.
