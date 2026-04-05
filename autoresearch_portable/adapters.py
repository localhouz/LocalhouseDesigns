from __future__ import annotations

import itertools
import json
from pathlib import Path
from typing import Any, Callable

from .common import load_json, run_shell, synapse_context, write_json

Adapter = Callable[[dict[str, Any], Path, Path, Path], dict[str, Any]]
ADAPTERS: dict[str, Adapter] = {}


def register_adapter(name: str) -> Callable[[Adapter], Adapter]:
    def decorator(func: Adapter) -> Adapter:
        ADAPTERS[name] = func
        return func
    return decorator


def resolve_metric_path(base: Path, value: str) -> Path:
    path = Path(value)
    return path if path.is_absolute() else (base / path)


def read_dotted(payload: dict[str, Any], key_path: str) -> Any:
    current: Any = payload
    for part in key_path.split("."):
        if not isinstance(current, dict):
            raise KeyError(f"Cannot descend into non-dict value at '{part}'")
        current = current[part]
    return current


def read_json_metric(payload: dict[str, Any], key_path: str) -> float:
    return float(read_dotted(payload, key_path))


def set_dotted_value(payload: dict[str, Any], key_path: str, value: Any) -> None:
    current = payload
    parts = key_path.split(".")
    for part in parts[:-1]:
        next_value = current.get(part)
        if not isinstance(next_value, dict):
            next_value = {}
            current[part] = next_value
        current = next_value
    current[parts[-1]] = value


def build_env(repo_root: Path, workspace: Path, run_dir: Path, objective: dict[str, Any]) -> tuple[dict[str, str], dict[str, object]]:
    synapse = synapse_context(repo_root)
    env = {
        "AUTORESEARCH_RUN_DIR": str(run_dir),
        "AUTORESEARCH_WORKSPACE": str(workspace),
        "AUTORESEARCH_OBJECTIVE": str(objective.get("name", "")),
        "AUTORESEARCH_SYNAPSE_ENABLED": "1" if synapse.get("enabled") else "0",
        "AUTORESEARCH_SYNAPSE_ROOT": str(synapse.get("root", "")),
        "AUTORESEARCH_SYNAPSE_CONFIG": str(synapse.get("config", "")),
        "AUTORESEARCH_SYNAPSE_DATA": str(synapse.get("dataRoot", "")),
        "AUTORESEARCH_SYNAPSE_CHROMA": str(synapse.get("chroma", "")),
    }
    return env, synapse


def run_commands(commands: list[str], workspace: Path, env: dict[str, str]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for command in commands:
        completed = run_shell(command, workspace, env=env)
        rows.append(
            {
                "command": command,
                "ok": completed.returncode == 0,
                "returncode": int(completed.returncode),
                "stdout": (completed.stdout or "")[-4000:],
                "stderr": (completed.stderr or "")[-4000:],
            }
        )
    return rows


def mutation_grid(search_space: list[dict[str, Any]]) -> list[dict[str, Any]]:
    dimensions: list[tuple[str, list[Any]]] = []
    for item in search_space:
        dimensions.append((str(item["key"]), list(item["values"])))
    if not dimensions:
        return []
    rows: list[dict[str, Any]] = []
    for values in itertools.product(*(dimension[1] for dimension in dimensions)):
        row: dict[str, Any] = {}
        for idx, (key, _) in enumerate(dimensions):
            row[key] = values[idx]
        rows.append(row)
    return rows


@register_adapter("command_metric")
def command_metric(objective: dict[str, Any], repo_root: Path, workspace: Path, run_dir: Path) -> dict[str, Any]:
    env, synapse = build_env(repo_root, workspace, run_dir, objective)
    setup_results = run_commands(list(objective.get("setup_commands", []) or []), workspace, env)
    if any(not row["ok"] for row in setup_results):
        return {
            "adapter": "command_metric",
            "failed": True,
            "summary": "Setup commands failed.",
            "commands": setup_results,
            "artifacts": [],
            "candidate_metric": 0.0,
            "synapse": synapse,
        }

    experiment_results = run_commands(list(objective.get("experiment_commands", []) or []), workspace, env)
    metric_spec = dict(objective.get("candidate_metric_source", {}) or {})
    metric_file = resolve_metric_path(workspace, str(metric_spec.get("path", "")))
    experiment_failed = any(not row["ok"] for row in experiment_results)
    if not metric_file.exists():
        return {
            "adapter": "command_metric",
            "failed": True,
            "summary": "Experiment commands failed." if experiment_failed else f"Metric file missing: {metric_file}",
            "commands": [*setup_results, *experiment_results],
            "artifacts": [],
            "candidate_metric": 0.0,
            "synapse": synapse,
        }

    metric_payload = load_json(metric_file)
    candidate_metric = read_json_metric(metric_payload, str(metric_spec["key"]))
    artifacts = sorted(set([str(metric_file.relative_to(workspace)).replace("\\", "/"), *list(objective.get("expected_artifacts", []) or [])]))
    return {
        "adapter": "command_metric",
        "failed": experiment_failed,
        "summary": "Experiment commands failed." if experiment_failed else str(objective.get("success_summary", "Objective completed.")),
        "commands": [*setup_results, *experiment_results],
        "artifacts": artifacts,
        "candidate_metric": candidate_metric,
        "metricPayload": metric_payload,
        "synapse": synapse,
    }


@register_adapter("mutation_search_metric")
def mutation_search_metric(objective: dict[str, Any], repo_root: Path, workspace: Path, run_dir: Path) -> dict[str, Any]:
    env, synapse = build_env(repo_root, workspace, run_dir, objective)
    mutation_spec = dict(objective.get("mutation_search", {}) or {})
    target_file = resolve_metric_path(workspace, str(mutation_spec.get("target_file", "")))
    original_payload = load_json(target_file)
    best_payload = json.loads(json.dumps(original_payload))
    best_metric = float(objective.get("baseline_metric", 0.0) or 0.0)
    best_candidate: dict[str, Any] | None = None
    best_metric_payload: dict[str, Any] = {}
    iteration_reports: list[dict[str, Any]] = []
    commands_run: list[dict[str, Any]] = []
    successful_candidates = 0
    search_grid = mutation_grid(list(mutation_spec.get("search_space", []) or []))
    max_candidates = int(mutation_spec.get("max_candidates", len(search_grid)) or len(search_grid))

    for index, candidate in enumerate(search_grid[:max_candidates], start=1):
        working_payload = json.loads(json.dumps(original_payload))
        for key_path, value in candidate.items():
            set_dotted_value(working_payload, key_path, value)
        write_json(target_file, working_payload)
        experiment_results = run_commands(list(mutation_spec.get("experiment_commands", []) or []), workspace, env)
        commands_run.extend(experiment_results)
        metric_spec = dict(mutation_spec.get("candidate_metric_source", {}) or {})
        metric_file = resolve_metric_path(workspace, str(metric_spec.get("path", "")))
        if any(not row["ok"] for row in experiment_results) or not metric_file.exists():
            iteration_reports.append({"index": index, "candidate": candidate, "ok": False, "metric": float(objective.get("baseline_metric", 0.0) or 0.0)})
            continue
        metric_payload = load_json(metric_file)
        metric = read_json_metric(metric_payload, str(metric_spec["key"]))
        successful_candidates += 1
        improved = metric >= best_metric
        iteration_reports.append({"index": index, "candidate": candidate, "ok": True, "metric": metric, "improved": improved})
        if improved:
            best_metric = metric
            best_candidate = dict(candidate)
            best_payload = json.loads(json.dumps(working_payload))
            best_metric_payload = dict(metric_payload)

    write_json(target_file, best_payload if best_candidate is not None else original_payload)
    search_report = {
        "baseline_metric": float(objective.get("baseline_metric", 0.0) or 0.0),
        "best_metric": best_metric,
        "best_candidate": best_candidate,
        "successfulCandidates": successful_candidates,
        "iterations": iteration_reports,
        "target_file": str(target_file.relative_to(workspace)).replace("\\", "/"),
    }
    report_name = str(mutation_spec.get("search_report_path", "mutation-search-results.json"))
    write_json(run_dir / report_name, search_report)
    metric_artifact = str(mutation_spec.get("candidate_metric_source", {}).get("path", ""))
    artifacts = sorted(set([report_name, metric_artifact, *list(objective.get("expected_artifacts", []) or [])]))
    return {
        "adapter": "mutation_search_metric",
        "failed": successful_candidates == 0,
        "summary": str(objective.get("success_summary", "Mutation search objective completed.")),
        "commands": commands_run,
        "artifacts": artifacts,
        "candidate_metric": best_metric,
        "metricPayload": best_metric_payload or search_report,
        "best_candidate": best_candidate,
        "searchReport": search_report,
        "synapse": synapse,
    }


def execute_objective(objective: dict[str, Any], repo_root: Path, workspace: Path, run_dir: Path) -> dict[str, Any]:
    adapter_name = str(objective.get("adapter", "command_metric"))
    adapter = ADAPTERS.get(adapter_name)
    if adapter is None:
        raise ValueError(f"Unsupported adapter: {adapter_name}")
    return adapter(objective, repo_root, workspace, run_dir)


def list_adapters() -> list[str]:
    return sorted(ADAPTERS.keys())
