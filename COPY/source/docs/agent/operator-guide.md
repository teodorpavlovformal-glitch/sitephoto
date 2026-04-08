# Operator Guide

## Prompts and triggers

- Manual API trigger: `POST /runs`
- GitHub comment trigger: comment on an issue with `/agent <objective>`
- Vercel deployment trigger: send a deployment webhook to `/webhooks/vercel`

## Branch and PR conventions

- Default implementation branches should use the `codex/` prefix.
- PRs should include:
  - objective summary
  - approval status
  - browser QA result or pending note
  - risk notes

## Vercel setup

Configure two Vercel projects from the same repo:

1. Site project root directory: `apps/site`
2. Control-plane project root directory: `apps/control-plane`

Because `.vercel/project.json` only stores one active link at a time, link the control plane from inside `apps/control-plane` when you are ready to manage that project locally.

## Local commands

- `npm run dev:site`
- `npm run dev:control`
- `npm run agent:dispatch -- --objective "Refresh the homepage copy"`
- `npm run agent:worker -- --run-id run_...`
