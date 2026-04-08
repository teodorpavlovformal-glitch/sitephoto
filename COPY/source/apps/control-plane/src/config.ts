import { z } from "zod";

const configSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  CONTROL_PLANE_PORT: z.coerce.number().int().min(1).max(65_535).default(8787),
  DATABASE_URL: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_PLANNER_MODEL: z.string().default("gpt-5.1-codex"),
  OPENAI_REVIEW_MODEL: z.string().default("gpt-5.1-codex"),
  GITHUB_TOKEN: z.string().optional(),
  GITHUB_OWNER: z.string().default("teodorpavlovformal-glitch"),
  GITHUB_REPO: z.string().default("newsitelegit"),
  GITHUB_WORKFLOW_ID: z.string().default("agent-run.yml"),
  GITHUB_WEBHOOK_SECRET: z.string().optional(),
  VERCEL_WEBHOOK_SECRET: z.string().optional(),
  AGENT_SHARED_SECRET: z.string().optional(),
  AGENT_SITE_PROJECT_ID: z.string().default("prj_f5YUnHnxHGF0P1zaStsrU60SYIRC"),
  AGENT_SITE_TEAM_ID: z.string().default("team_GPpE4Y61eFX6cuyZCAymNuB7")
});

export type RuntimeConfig = z.infer<typeof configSchema>;

export function getConfig(overrides: Partial<Record<keyof RuntimeConfig, unknown>> = {}) {
  return configSchema.parse({
    ...process.env,
    ...overrides
  });
}
