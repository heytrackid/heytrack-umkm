# Agents Overview

## Purpose
- Provide autonomous and semi-autonomous workflows supporting HeyTrack operations.
- Coordinate data across Supabase, Next.js routes, and automation pipelines.
- Ensure consistency by using a single source of truth for domain logic and configuration.

## Core Agent Types
1. **Workflow Agents** – Orchestrate multi-step business processes (order fulfillment, inventory restocking).
2. **Insight Agents** – Analyze Supabase data to surface trends, anomalies, and performance alerts.
3. **Assistant Agents** – Power conversational interfaces (chatbot, guided forms) with contextual suggestions.
4. **Automation Agents** – Execute recurring background jobs (reconciliations, notifications, exports).

Each agent type maps to a module under `src/agents`, all adhering to the shared base interface.

## Architecture
```text
src/agents/
├── base/            # Shared contracts, utilities, error classes
├── workflows/       # Long-running orchestration logic
├── insights/        # Analytical and reporting agents
├── assistants/      # User-facing conversational agents
└── automations/     # Scheduled or trigger-based jobs
```

### Core Contracts
- `AgentContext` – Structured environment (Supabase clients, caches, feature toggles).
- `AgentTask` – Declarative description of the work to perform.
- `AgentResult` – Standardized success/failure payload for telemetry and UI consumers.

Contracts live in `src/agents/base` to avoid duplication and keep TypeScript definitions centralized.

## Lifecycle
1. **Initialization** – Build context from request/session or cron trigger.
2. **Planning** – Expand a task into actionable steps with dependency tracking.
3. **Execution** – Perform side effects through service-layer adapters only when required.
4. **Observation** – Gather intermediate state, metrics, and structured logs.
5. **Reflection** – Summarize outcomes, update caches, enqueue follow-up tasks as needed.

Deferring side effects until execution keeps planning deterministic and improves testability.

## Configuration & Storage
- Feature flags: `src/config/feature-flags.ts`
- Secrets: `.env.local` or platform secret manager (never hard-code)
- Persistent data: Supabase tables/views defined in `src/types/supabase-generated.ts`
- Ephemeral cache: `src/lib/cache` with optional Redis adapter

## Logging & Observability
- Use `createLogger('AgentName')` from `src/lib/logger.ts` for structured logs.
- Emit metrics via `src/lib/telemetry`; prefer descriptive event names (e.g., `agent.workflow.run`).
- Attach `correlationId` from context to each log for traceability.

## Error Handling
- Throw domain-specific errors from `src/agents/base/errors.ts`.
- Convert caught errors into `AgentResult` objects with remediation hints.
- Route critical failures through notification agents (Slack, email) where available.

## Testing Guidelines
- Unit tests per agent module in colocated `__tests__` folders; mock external services.
- Integration smoke tests via Playwright or API harness.
- Fixture builders provide deterministic Supabase data setups.

## Development Workflow
1. Implement or update agent logic within the relevant subdirectory.
2. Export the agent from `src/agents/index.ts` to maintain a single source of exports.
3. Document user-facing behaviors in `docs/agents/` when scenarios need step-by-step guides.
4. Run `pnpm test agents` (or broader suites) before submitting changes.

## Deployment Checklist
- ✅ TypeScript build passes (`pnpm build`).
- ✅ Environment variables documented in `ENVIRONMENT.md`.
- ✅ Rollback strategy noted in change description or runbook.
- ✅ Observability dashboards updated with new metrics/events.

## Best Practices
- Keep agent modules under ~200 lines; extract shared helpers into `src/agents/base` or domain utilities to preserve single-source logic.
- Reuse shared adapters (Supabase operations, notification clients, cache helpers) instead of duplicating queries or HTTP calls.
- Design planners to be pure functions and isolate side effects inside executor utilities for easier testing and deterministic previews.
- Always pass the typed `AgentContext` object rather than raw dependencies to maintain consistent feature-flag, telemetry, and credential handling.
- Wrap external service calls and long-running steps with standardized retry/timeout helpers from `src/lib` to prevent hung executions.
- Validate task inputs with shared Zod schemas before execution, and normalize outputs to the canonical `AgentResult` structure.
- Propagate the `correlationId` and user/session metadata through downstream calls so logs, metrics, and notifications stay traceable.
- Document non-obvious fallbacks or circuit-breaker behavior inline so future agents do not reinvent incompatible patterns.

## Future Enhancements
- Add reinforcement-learning feedback loops for assistant agents.
- Expand insight agents with anomaly detection using time-series baselines.
- Introduce user-facing toggles to schedule or pause automation agents.
- Provide CLI tooling to inspect and trigger agents during debugging.
