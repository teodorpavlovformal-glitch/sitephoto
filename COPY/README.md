# COPY Folder

This folder is a safe, reusable snapshot of the current `SITEFULLBUILD` codebase to use as a model for future sites.

## What is included

- Full source folders:
  - `.github`
  - `apps`
  - `docs`
  - `packages`
  - `tests`
- Root config and repo files:
  - `.env.example`
  - `.gitignore`
  - `AGENTS.md`
  - `biome.json`
  - `package.json`
  - `playwright.config.ts`
  - `pnpm-lock.yaml`
  - `pnpm-workspace.yaml`
  - `README.md`
  - `tsconfig.json`

All of that live code is mirrored under [source](C:\Users\Admin\Desktop\SITEFULLBUILD\COPY\source).

## What is intentionally excluded

These were left out on purpose so this stays safe, portable, and reusable:

- `.env.local`
- `.git`
- `.codex`
- `.vercel`
- `node_modules`
- `playwright-report`
- `test-results`
- `model-snapshots`
- `COPY` itself from the source mirror
- `New folder`

## Notes

- This is a source snapshot, not a machine clone.
- It keeps the code and configs as they exist now.
- It does not include local secrets or generated dependency folders.
- Installed/downloaded tooling and package inventory are documented in [DOWNLOADED-STUFF.md](C:\Users\Admin\Desktop\SITEFULLBUILD\COPY\DOWNLOADED-STUFF.md).
