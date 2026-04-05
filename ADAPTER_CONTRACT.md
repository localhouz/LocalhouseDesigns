# Adapter Contract

Adapters live in `autoresearch_portable/adapters.py`.

Each adapter is registered with `@register_adapter("name")` and must implement:

```python
def adapter(objective: dict[str, Any], repo_root: Path, workspace: Path, run_dir: Path) -> dict[str, Any]:
    ...
```

The returned payload should include:

- `adapter`: adapter name
- `failed`: `bool`
- `summary`: short human-readable summary
- `commands`: list of command result rows when relevant
- `artifacts`: list of produced artifact paths relative to the workspace when possible
- `candidate_metric`: numeric metric used for comparison
- `metricPayload`: parsed metric payload used by gate checks

Optional fields are allowed, for example:

- `synapse`
- `best_candidate`
- `searchReport`

The runner assumes:

- `candidate_metric` is lower-is-better for champion comparison right now
- `metricPayload` supports dotted-key reads used by gate checks
- `artifacts` can be compared against `expected_artifacts`

Guidelines:

- keep repo-specific logic inside the adapter or repo-local eval scripts, not the runner
- write run artifacts into `run_dir` when they are run-specific
- expose Synapse-dependent behavior through the env vars already provided by `build_env`
- prefer stable JSON metric outputs so gating remains portable
