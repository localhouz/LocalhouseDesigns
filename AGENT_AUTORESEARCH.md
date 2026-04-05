# Agent Autoresearch

This tool is designed to be usable without human intervention.
It is also designed so agent mode stays inside the gated system by default.

## Preferred Flow

For an agent entering a repo cold, use:

```powershell
python portable_autoresearch.py --repo-root . agent-ready
python portable_autoresearch.py --repo-root . agent-run
```

`agent-ready` will:

- ensure bundled templates exist in `templates/` when missing
- load the repo profile
- report shell health
- resolve the default policy/objective/suite
- return a machine-readable JSON payload

`agent-run` will:

- self-bootstrap templates when needed
- use profile defaults and aliases
- choose a mode automatically unless overridden
- execute without asking for input
- run in an isolated workspace when gated mode is enforced
- stop at the gate verdict and not promote automatically

## Safety Model

By default:

- `agent_enforce_gated_mode` is `true`
- `agent_workspace_mode` is `scratch`
- agent mode does not call `promote-run`
- promotion requires a valid signed allow token by default

That means agent execution evaluates in isolation and returns a gated result instead of mutating the main repo directly.

## Allow Gate

For stronger control, promotion can require a signed allow token:

```powershell
python portable_autoresearch.py --repo-root . issue-allow --run-id <run-id>
python portable_autoresearch.py --repo-root . verify-allow --run-id <run-id>
python portable_autoresearch.py --repo-root . promote-run --run-id <run-id>
```

Important:

- the token is only meaningful if `AUTORESEARCH_GATE_SECRET` is set outside the agent's control
- without an external secret, no in-repo token is truly unfakeable
- the tool verifies the token against current run artifacts before promotion

## Profile Fields For Agents

- `agent_default_command`: `objective`, `suite`, `all`, or `auto`
- `agent_resume_batches`: whether `agent-run` should resume `run-all-suites`
- `agent_enforce_gated_mode`: require isolated gated execution for agent mode
- `agent_workspace_mode`: isolated workspace mode for agent runs, recommended `scratch` or `worktree`
- `auto_bootstrap_templates`: bootstrap templates automatically when missing
- `auto_sync_templates`: overwrite/sync bundled templates on every agent-ready/agent-run
- `require_allow_token_for_promotion`: require signed allow token before promotion
- `default_policy`
- `default_objective`
- `default_suite`
- `default_workspace_mode`
- `objective_aliases`
- `suite_aliases`

## Recommended Repo Setup

- keep repo-specific configs in `templates/`
- set `default_policy`
- set `default_objective` or `default_suite`
- keep eval scripts non-interactive and JSON-emitting

## Output Contract

Commands print JSON to stdout and use exit codes consistently:

- `0` for success/promotable/healthy states
- non-zero for blocked or failed execution paths
