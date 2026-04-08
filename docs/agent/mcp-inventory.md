# MCP Inventory

The repo is designed around a small, explicit MCP/tool surface:

- OpenAI docs MCP for up-to-date product and API guidance
- GitHub connector or CLI-equivalent automation for issues, PRs, and workflow dispatch
- Vercel tooling for deployments, preview URLs, and project metadata
- Playwright MCP for deterministic browser work
- Filesystem and fetch-style tools for repo-local inspection and remote API calls

## V1 rule

Browser automation stays on Playwright and Playwright MCP only. Stagehand is intentionally deferred until there is a concrete need for fuzzy browser tasks.
