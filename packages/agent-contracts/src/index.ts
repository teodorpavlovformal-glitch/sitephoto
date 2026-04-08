import { z } from "zod";

export const triggerSourceSchema = z.enum([
  "manual",
  "github_issue",
  "github_comment",
  "vercel_deployment",
  "cli",
  "github_actions"
]);

export const specialistRoleSchema = z.enum([
  "planner",
  "site-code",
  "repo-ops",
  "browser-qa",
  "review-security",
  "api-data"
]);

export const riskGateTypeSchema = z.enum([
  "dependency_change",
  "secret_change",
  "auth_change",
  "data_model_change",
  "production_promotion",
  "merge"
]);

export const verificationKindSchema = z.enum(["lint", "test", "e2e", "manual", "preview"]);
export const planStepStatusSchema = z.enum(["pending", "in_progress", "completed", "blocked"]);
export const approvalStatusSchema = z.enum(["pending", "approved", "rejected"]);
export const runStatusSchema = z.enum([
  "received",
  "planning",
  "awaiting_approval",
  "approved",
  "queued_for_execution",
  "qa_pending",
  "reviewing",
  "completed",
  "blocked",
  "rejected",
  "failed"
]);

export const artifactKindSchema = z.enum([
  "plan",
  "log",
  "screenshot",
  "trace",
  "summary",
  "workflow-dispatch",
  "qa-report",
  "response-job",
  "review"
]);

export const repoTargetSchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
  branch: z.string().min(1).default("main"),
  baseBranch: z.string().min(1).default("main"),
  workingDirectory: z.string().min(1).default(".")
});

export const acceptanceCriteriaSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  verification: verificationKindSchema,
  required: z.boolean().default(true)
});

export const riskGateSchema = z.object({
  type: riskGateTypeSchema,
  reason: z.string().min(1),
  approvalRequired: z.boolean().default(true)
});

export const taskPlanStepSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  role: specialistRoleSchema,
  description: z.string().min(1),
  status: planStepStatusSchema.default("pending")
});

export const taskPlanSchema = z.object({
  summary: z.string().min(1),
  steps: z.array(taskPlanStepSchema).min(1),
  acceptanceCriteria: z.array(acceptanceCriteriaSchema).default([]),
  riskGates: z.array(riskGateSchema).default([]),
  rollbackPlan: z.array(z.string()).default([])
});

export const runRequestSchema = z.object({
  title: z.string().min(1),
  objective: z.string().min(1),
  prompt: z.string().min(1),
  source: triggerSourceSchema,
  requestedBy: z.string().min(1).default("system"),
  repoTarget: repoTargetSchema,
  specialistRoles: z
    .array(specialistRoleSchema)
    .default(["planner", "site-code", "repo-ops", "browser-qa", "review-security"]),
  acceptanceCriteria: z.array(acceptanceCriteriaSchema).default([]),
  riskGates: z.array(riskGateSchema).default([]),
  previewUrl: z.string().url().optional(),
  metadata: z.record(z.string()).default({})
});

export const approvalDecisionSchema = z.object({
  runId: z.string().min(1),
  gateType: riskGateTypeSchema,
  approved: z.boolean(),
  approvedBy: z.string().min(1),
  note: z.string().optional()
});

export const runArtifactSchema = z.object({
  id: z.string().min(1).optional(),
  kind: artifactKindSchema,
  label: z.string().min(1),
  url: z.string().url().optional(),
  content: z.string().optional(),
  metadata: z.record(z.unknown()).default({}),
  createdAt: z.string().optional()
});

export const approvalSnapshotSchema = z.object({
  gateType: riskGateTypeSchema,
  status: approvalStatusSchema,
  reason: z.string().min(1)
});

export const runSummarySchema = z.object({
  runId: z.string().min(1),
  status: runStatusSchema,
  plan: taskPlanSchema.optional(),
  approvals: z.array(approvalSnapshotSchema).default([]),
  reviewNotes: z.array(z.string()).default([]),
  nextActions: z.array(z.string()).default([]),
  artifacts: z.array(runArtifactSchema).default([])
});

export const runStepRecordSchema = z.object({
  id: z.string().min(1),
  key: z.string().min(1),
  role: specialistRoleSchema,
  status: planStepStatusSchema,
  details: z.record(z.unknown()).default({}),
  startedAt: z.string().min(1),
  completedAt: z.string().nullable().default(null)
});

export const storedApprovalSchema = z.object({
  id: z.string().min(1),
  gateType: riskGateTypeSchema,
  reason: z.string().min(1),
  status: approvalStatusSchema,
  requestedBy: z.string().min(1),
  approvedBy: z.string().nullable().default(null),
  note: z.string().nullable().default(null),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1)
});

export const runRecordSchema = z.object({
  id: z.string().min(1),
  status: runStatusSchema,
  request: runRequestSchema,
  plan: taskPlanSchema.optional(),
  summary: runSummarySchema.optional(),
  approvals: z.array(storedApprovalSchema).default([]),
  artifacts: z.array(runArtifactSchema).default([]),
  steps: z.array(runStepRecordSchema).default([]),
  plannerResponseId: z.string().nullable().default(null),
  reviewResponseId: z.string().nullable().default(null),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1)
});

export type TriggerSource = z.infer<typeof triggerSourceSchema>;
export type SpecialistRole = z.infer<typeof specialistRoleSchema>;
export type RiskGateType = z.infer<typeof riskGateTypeSchema>;
export type VerificationKind = z.infer<typeof verificationKindSchema>;
export type PlanStepStatus = z.infer<typeof planStepStatusSchema>;
export type ApprovalStatus = z.infer<typeof approvalStatusSchema>;
export type RunStatus = z.infer<typeof runStatusSchema>;
export type ArtifactKind = z.infer<typeof artifactKindSchema>;
export type RepoTarget = z.infer<typeof repoTargetSchema>;
export type AcceptanceCriteria = z.infer<typeof acceptanceCriteriaSchema>;
export type RiskGate = z.infer<typeof riskGateSchema>;
export type TaskPlanStep = z.infer<typeof taskPlanStepSchema>;
export type TaskPlan = z.infer<typeof taskPlanSchema>;
export type RunRequest = z.infer<typeof runRequestSchema>;
export type ApprovalDecision = z.infer<typeof approvalDecisionSchema>;
export type RunArtifact = z.infer<typeof runArtifactSchema>;
export type ApprovalSnapshot = z.infer<typeof approvalSnapshotSchema>;
export type RunSummary = z.infer<typeof runSummarySchema>;
export type RunStepRecord = z.infer<typeof runStepRecordSchema>;
export type StoredApproval = z.infer<typeof storedApprovalSchema>;
export type RunRecord = z.infer<typeof runRecordSchema>;
