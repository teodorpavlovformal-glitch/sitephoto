create table if not exists agent_runs (
  id text primary key,
  status text not null,
  title text not null,
  source text not null,
  requested_by text not null,
  repo_owner text not null,
  repo_name text not null,
  repo_branch text not null,
  base_branch text not null,
  working_directory text not null,
  preview_url text,
  request_json jsonb not null,
  plan_json jsonb,
  summary_json jsonb,
  planner_response_id text,
  review_response_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists agent_steps (
  id text primary key,
  run_id text not null references agent_runs(id) on delete cascade,
  step_key text not null,
  role text not null,
  status text not null,
  details_json jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (run_id, step_key)
);

create table if not exists artifacts (
  id text primary key,
  run_id text not null references agent_runs(id) on delete cascade,
  kind text not null,
  label text not null,
  url text,
  content text,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists approvals (
  id text primary key,
  run_id text not null references agent_runs(id) on delete cascade,
  gate_type text not null,
  reason text not null,
  status text not null,
  requested_by text not null,
  approved_by text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (run_id, gate_type)
);
