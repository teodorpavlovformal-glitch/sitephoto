import { getConfig, type RuntimeConfig } from "./config.js";
import { AgentOrchestrator } from "./orchestrator.js";
import {
  InMemoryRunRepository,
  PostgresRunRepository,
  type RunRepository
} from "./repository.js";

export type RuntimeDependencies = {
  config: RuntimeConfig;
  repository: RunRepository;
  orchestrator: AgentOrchestrator;
};

export function createRuntime(overrides: Partial<RuntimeDependencies> = {}) {
  const config = overrides.config ?? getConfig();
  const repository =
    overrides.repository ??
    (config.DATABASE_URL ? new PostgresRunRepository(config.DATABASE_URL) : new InMemoryRunRepository());
  const orchestrator = overrides.orchestrator ?? new AgentOrchestrator(config, repository);

  return {
    config,
    repository,
    orchestrator
  };
}
