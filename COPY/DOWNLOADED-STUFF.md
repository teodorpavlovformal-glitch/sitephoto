# Downloaded / Installed Stuff Inventory

This document lists the important tools, runtimes, CLIs, browsers, and repo packages involved in this `SITEFULLBUILD` setup.

It is split into:

- machine-level tools installed on the computer
- browser binaries downloaded for Playwright
- direct repo dependencies declared in `package.json` files
- things that were discussed in the transcript but are not installed in the current repo

## 1. Machine-Level Tools Installed

These are available on this machine right now:

- Node.js: `v24.14.1`
- npm: `11.11.0`
- pnpm: `10.33.0`
- Git: `2.53.0.windows.2`
- OpenAI Codex CLI: `codex-cli 0.118.0`
- Playwright CLI: `1.59.1`

## 2. Playwright Browser / Runtime Downloads Present

These browser/runtime assets are present in the local Playwright cache:

- `chromium-1217`
- `chromium_headless_shell-1217`
- `firefox-1511`
- `webkit-2272`
- `ffmpeg-1011`
- `winldd-1007`

## 3. Direct Repo Dependencies

These are the packages directly declared by the repo right now.

### Root devDependencies

- `@biomejs/biome` `^1.9.4`
- `@playwright/test` `^1.53.0`
- `@types/node` `^22.10.1`
- `tsx` `^4.19.2`
- `typescript` `^5.6.3`

### `apps/control-plane` dependencies

- `@langchain/core` `^0.3.75`
- `@langchain/langgraph` `^0.2.50`
- `@pavlov/agent-contracts` `workspace:*`
- `dotenv` `^16.4.7`
- `openai` `^4.14.2`
- `pg` `^8.13.1`
- `zod` `^3.23.8`

### `apps/site` dependencies

- `framer-motion` `^12.23.12`
- `react` `^18.3.1`
- `react-dom` `^18.3.1`

### `apps/site` devDependencies

- `@vitejs/plugin-react` `^4.7.0`
- `vite` `^7.1.7`

### `packages/agent-contracts` dependencies

- `zod` `^3.23.8`

## 4. Project / Tooling Stack In Use

These are not all npm packages, but they are part of the actual working stack:

- GitHub Actions workflows
- Vercel deployment configuration
- Biome for lint/format
- Playwright for browser QA / e2e
- TypeScript
- TSX for running TS entrypoints
- React
- Vite
- Framer Motion
- LangGraph
- OpenAI SDK
- Postgres driver (`pg`)
- Zod
- dotenv

## 5. What The Transcript Shows Was Installed Or Activated During Setup

Based on the conversation history, these actions happened during setup:

- Node.js and npm were installed for the machine
- Git was installed/configured
- OpenAI Codex CLI was installed globally
- pnpm was activated through Corepack and used for workspace installation
- Playwright browsers were installed/downloaded
- repo dependencies were installed
- Framer Motion was added for the site app
- React and React DOM were added for the site app
- Vite and `@vitejs/plugin-react` were added for the site app
- Zod was aligned to `^3.23.8`

## 6. Mentioned In The Transcript But Not Installed In The Current Repo

These were discussed, recommended, or referenced, but they are not direct dependencies in the repo as it exists now:

- Tailwind CSS
- shadcn/ui
- PydanticAI
- Stagehand
- Browserbase MCP
- Tailwind/shadcn-based component system

## 7. Important Safety Note

This inventory does not treat local secrets as part of the template.

Not copied into `COPY/source`:

- `.env.local`
- `.git`
- `node_modules`
- local caches and test artifacts

That is intentional. The `COPY` folder is meant to be a reusable model for future sites, not a secret-bearing machine clone.
