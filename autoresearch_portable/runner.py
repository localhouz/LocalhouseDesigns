from __future__ import annotations

import shutil
import time
from pathlib import Path
from typing import Any

from .adapters import execute_objective
from .allow_gate import verify_allow_token
from .common import current_branch, load_json, make_run_id, objective_files, resolve_config_path, suite_files, synapse_context, write_json
from .gate import evaluate_gate
from .history import (
    append_history,
    build_objective_trend,
    build_promotion_summary,
    build_suite_trend,
    load_champions,
    load_history,
    load_suite_champions,
    update_champion,
    update_suite_champion,
)
from .promotion import promote_run
from .reporting import write_rollup_checkpoint, write_suite_summary
from .workspace import diff_snapshot, list_changed_files, prepare_workspace, snapshot_paths, write_workspace_diff


def init_manifest(run_id: str, objective_name: str, objective_path: str, workspace_mode: str) -> dict[str, Any]:
    now_ms = int(time.time() * 1000)
    return {
        "run_id": run_id,
        "objective_name": objective_name,
        "objective_path": objective_path,
        "workspace_mode": workspace_mode,
        "status": "prepared",
        "created_at_ms": now_ms,
        "updated_at_ms": now_ms,
    }


def update_manifest(run_dir: Path, manifest: dict[str, Any], **updates: Any) -> dict[str, Any]:
    manifest.update(updates)
    manifest["updated_at_ms"] = int(time.time() * 1000)
    write_json(run_dir / "manifest.json", manifest)
    return manifest


def write_summary(run_dir: Path, manifest: dict[str, Any], results: dict[str, Any], gate: dict[str, Any]) -> None:
    lines = [
        f"# Autoresearch Run {manifest['run_id']}",
        "",
        f"- objective: `{manifest['objective_name']}`",
        f"- status: `{manifest['status']}`",
        f"- verdict: `{gate['verdict']}`",
        f"- candidate metric: `{results.get('candidate_metric', 0)}`",
        f"- summary: {results.get('summary', '')}",
    ]
    if gate.get("reasons"):
        lines.extend(["", "## Gate Reasons"])
        for reason in gate["reasons"]:
            lines.append(f"- `{reason}`")
    (run_dir / "summary.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def prepare_run(objective_value: str, config_root: Path, repo_root: Path, state_root: Path, workspace_mode: str | None) -> dict[str, Any]:
    objective_path = resolve_config_path(objective_value, config_root, repo_root)
    objective = load_json(objective_path)
    run_id = make_run_id()
    runs_root = state_root / "runs"
    runs_root.mkdir(parents=True, exist_ok=True)
    run_dir = runs_root / run_id
    run_dir.mkdir(parents=True, exist_ok=False)
    selected_mode = str(workspace_mode or objective.get("workspace_mode", "in_place"))
    workspace = prepare_workspace(repo_root, state_root, run_id, selected_mode)
    manifest = init_manifest(run_id, str(objective["name"]), str(objective_path), selected_mode)
    manifest["repo_root"] = str(repo_root)
    manifest["workspace"] = str(workspace)
    manifest["branch"] = current_branch(workspace)
    manifest["synapse"] = synapse_context(repo_root)
    repo_policy_path = objective.get("repo_policy")
    repo_policy = load_json(resolve_config_path(str(repo_policy_path), config_root, repo_root)) if repo_policy_path else {"allowed_paths": []}
    allowed_paths = list(repo_policy.get("allowed_paths", []) or [])
    manifest["baseline_snapshot"] = snapshot_paths(workspace, allowed_paths) if allowed_paths else {}
    write_json(run_dir / "manifest.json", manifest)
    return manifest


def execute_run(run_id: str, state_root: Path) -> dict[str, Any]:
    run_dir = state_root / "runs" / run_id
    manifest = load_json(run_dir / "manifest.json")
    objective = load_json(manifest["objective_path"])
    repo_root = Path(str(manifest["repo_root"]))
    workspace = Path(str(manifest["workspace"]))
    results = execute_objective(objective, repo_root, workspace, run_dir)
    diff_path = write_workspace_diff(workspace, run_dir / "workspace.patch")
    if diff_path is not None:
        artifacts = set(str(item) for item in list(results.get("artifacts", []) or []))
        artifacts.add("workspace.patch")
        results["artifacts"] = sorted(artifacts)
    write_json(run_dir / "results.json", results)
    update_manifest(run_dir, manifest, status="executed")
    return results


def evaluate_run_gate(run_id: str, policy_value: str, config_root: Path, repo_root: Path, state_root: Path) -> tuple[dict[str, Any], dict[str, Any]]:
    run_dir = state_root / "runs" / run_id
    manifest = load_json(run_dir / "manifest.json")
    results = load_json(run_dir / "results.json")
    objective = load_json(manifest["objective_path"])
    repo_policy = load_json(resolve_config_path(policy_value, config_root, repo_root))
    workspace = Path(str(manifest["workspace"]))
    baseline_snapshot = dict(manifest.get("baseline_snapshot", {}) or {})
    allowed_paths = list(repo_policy.get("allowed_paths", []) or [])
    changed_files = diff_snapshot(workspace, baseline_snapshot, allowed_paths) if baseline_snapshot else list_changed_files(workspace)
    gate = evaluate_gate(objective, results, repo_policy=repo_policy, changed_files=changed_files)
    write_json(run_dir / "gate-report.json", gate)
    status = "promotable" if gate["ok"] else "blocked"
    manifest = update_manifest(run_dir, manifest, status=status, changed_files=changed_files)
    return manifest, gate


def run_objective(objective_value: str, policy_value: str, config_root: Path, repo_root: Path, state_root: Path, workspace_mode: str | None) -> dict[str, Any]:
    objective_path = resolve_config_path(objective_value, config_root, repo_root)
    objective = load_json(objective_path)
    manifest = prepare_run(objective_value, config_root, repo_root, state_root, workspace_mode)
    results = execute_run(str(manifest["run_id"]), state_root)
    manifest, gate = evaluate_run_gate(str(manifest["run_id"]), policy_value, config_root, repo_root, state_root)
    run_dir = state_root / "runs" / str(manifest["run_id"])
    write_summary(run_dir, manifest, results, gate)
    history_entry = {
        "runId": str(manifest["run_id"]),
        "objective": str(objective["name"]),
        "status": str(manifest["status"]),
        "verdict": gate["verdict"],
        "candidateMetric": float(results.get("candidate_metric", 0.0) or 0.0),
        "summary": str(results.get("summary", "")),
        "createdAtMs": int(time.time() * 1000),
    }
    append_history(state_root, str(objective["name"]), history_entry)
    update_champion(state_root, str(objective["name"]), history_entry)
    return history_entry


def run_suite(suite_value: str, policy_value: str, config_root: Path, repo_root: Path, state_root: Path, workspace_mode: str | None = None) -> dict[str, Any]:
    suite_path = resolve_config_path(suite_value, config_root, repo_root)
    suite = load_json(suite_path)
    started_at_ms = int(time.time() * 1000)
    rows: list[dict[str, Any]] = []
    for objective_name in list(suite.get("objectives", []) or []):
        rows.append(run_objective(str(objective_name), policy_value, config_root, repo_root, state_root, workspace_mode))
    passed = sum(1 for row in rows if row["verdict"] == "promotable")
    result = {
        "suite": str(suite.get("name", suite_path.stem)),
        "startedAtMs": started_at_ms,
        "completedAtMs": int(time.time() * 1000),
        "runs": rows,
        "summary": {"total": len(rows), "promotable": passed, "blocked": len(rows) - passed},
    }
    suite_dir = state_root / "suites"
    suite_dir.mkdir(parents=True, exist_ok=True)
    suite_artifact_tag = make_run_id()
    suite_artifact = suite_dir / f"{suite_artifact_tag}-{suite.get('name', 'suite')}.json"
    result["artifact"] = str(suite_artifact)
    result["suiteArtifactTag"] = suite_artifact_tag
    write_json(suite_artifact, result)
    trend = build_suite_trend(state_root, str(suite.get("name", suite_path.stem)), limit=10)
    summary_artifact = write_suite_summary(suite_dir, result, trend=trend)
    update_suite_champion(
        state_root,
        {
            "suite": str(suite.get("name", suite_path.stem)),
            "summary": dict(result.get("summary", {}) or {}),
            "artifact": str(suite_artifact),
            "summaryArtifact": str(summary_artifact),
            "createdAtMs": int(result.get("completedAtMs", 0) or 0),
        },
    )
    result["summaryArtifact"] = str(summary_artifact)
    return result


def _load_in_progress_rollup(state_root: Path) -> tuple[str | None, dict[str, Any] | None]:
    suite_dir = state_root / "suites"
    if not suite_dir.exists():
        return None, None
    latest = sorted(suite_dir.glob("*-rollup.json"), key=lambda path: path.stat().st_mtime, reverse=True)
    for path in latest:
        payload = load_json(path)
        if str(payload.get("status", "")) == "in_progress":
            batch_id = path.name[: -len("-rollup.json")]
            return batch_id, payload
    return None, None


def run_all_suites(policy_value: str, config_root: Path, repo_root: Path, state_root: Path, resume: bool = False, workspace_mode: str | None = None) -> dict[str, Any]:
    suite_paths = suite_files(config_root)
    batch_id, checkpoint = _load_in_progress_rollup(state_root) if resume else (None, None)
    if checkpoint:
        rows = list(checkpoint.get("suites", []) or [])
        promotable = int(checkpoint.get("promotableSuites", 0) or 0)
        completed = {str(row.get("suite", "")) for row in rows}
    else:
        batch_id = make_run_id()
        rows = []
        promotable = 0
        completed = set()
    total_suites = len(suite_paths)
    partial_rollup: dict[str, Any] = {
        "generatedAtMs": int(time.time() * 1000),
        "status": "in_progress",
        "totalSuites": total_suites,
        "completedSuites": len(rows),
        "suites": rows,
        "promotableSuites": promotable,
        "blockedSuites": max(0, len(rows) - promotable),
    }
    checkpoint_path = write_rollup_checkpoint(state_root, str(batch_id), partial_rollup)
    for suite_path in suite_paths:
        suite_payload = load_json(suite_path)
        suite_name = str(suite_payload.get("name", suite_path.stem))
        if suite_name in completed:
            continue
        result = run_suite(str(suite_path), policy_value, config_root, repo_root, state_root, workspace_mode=workspace_mode)
        summary = dict(result.get("summary", {}) or {})
        blocked = int(summary.get("blocked", 0) or 0)
        if blocked == 0:
            promotable += 1
        rows.append(
            {
                "suite": str(result.get("suite", "")),
                "summary": summary,
                "artifact": str(result.get("artifact", "")),
                "summaryArtifact": str(result.get("summaryArtifact", "")),
                "exitCode": 0 if blocked == 0 else 1,
            }
        )
        completed.add(suite_name)
        partial_rollup = {
            "generatedAtMs": int(time.time() * 1000),
            "status": "in_progress",
            "totalSuites": total_suites,
            "completedSuites": len(rows),
            "suites": rows,
            "promotableSuites": promotable,
            "blockedSuites": max(0, len(rows) - promotable),
        }
        checkpoint_path = write_rollup_checkpoint(state_root, str(batch_id), partial_rollup)
    rollup = {
        "generatedAtMs": int(time.time() * 1000),
        "status": "complete",
        "totalSuites": total_suites,
        "completedSuites": len(rows),
        "suites": rows,
        "promotableSuites": promotable,
        "blockedSuites": max(0, len(rows) - promotable),
        "artifact": str(checkpoint_path),
    }
    write_rollup_checkpoint(state_root, str(batch_id), rollup)
    return rollup


def list_runs(state_root: Path) -> list[dict[str, Any]]:
    runs_root = state_root / "runs"
    if not runs_root.exists():
        return []
    rows = [load_json(path) for path in runs_root.glob("*/manifest.json")]
    rows.sort(key=lambda row: (int(row.get("created_at_ms", 0) or 0), str(row.get("run_id", ""))), reverse=True)
    return rows


def show_run(run_id: str, state_root: Path) -> dict[str, Any]:
    run_dir = state_root / "runs" / run_id
    payload: dict[str, Any] = {}
    for name in ("manifest.json", "results.json", "gate-report.json", "promotion.json"):
        path = run_dir / name
        if path.exists():
            payload[name] = load_json(path)
    return payload


def suite_status(state_root: Path) -> dict[str, Any]:
    suite_dir = state_root / "suites"
    if not suite_dir.exists():
        return {"ok": False, "message": "No suite history yet."}
    latest = sorted((path for path in suite_dir.glob("*.json") if not path.name.endswith("-rollup.json")), key=lambda path: path.stat().st_mtime, reverse=True)
    if not latest:
        return {"ok": False, "message": "No suite history yet."}
    payload = load_json(latest[0])
    blocked: list[dict[str, Any]] = []
    for row in list(payload.get("runs", []) or []):
        if str(row.get("verdict", "")) == "promotable":
            continue
        run_dir = state_root / "runs" / str(row.get("runId", ""))
        gate = load_json(run_dir / "gate-report.json") if (run_dir / "gate-report.json").exists() else {}
        blocked.append({**row, "reasons": list(gate.get("reasons", []) or [])})
    return {"ok": True, "suite": payload.get("suite", ""), "summary": payload.get("summary", {}), "blockedRuns": blocked, "artifact": str(latest[0])}


def operator_status(config_root: Path, state_root: Path) -> dict[str, Any]:
    suites: list[dict[str, Any]] = []
    for suite_path in suite_files(config_root):
        suite_payload = load_json(suite_path)
        suite_name = str(suite_payload.get("name", suite_path.stem))
        trend = build_suite_trend(state_root, suite_name, limit=5)
        suites.append(
            {
                "suite": suite_name,
                "latest": trend.get("latest", {}),
                "champion": trend.get("champion", {}),
                "summary": dict((trend.get("latest", {}) or {}).get("summary", {}) or {}),
                "matchedChampion": bool(trend.get("matchedChampion", False)),
                "improvedVsPrevious": bool(trend.get("improvedVsPrevious", False)),
            }
        )
    suite_dir = state_root / "suites"
    latest_rollup = None
    if suite_dir.exists():
        rollups = sorted(suite_dir.glob("*-rollup.md"), key=lambda path: path.stat().st_mtime)
        if rollups:
            latest_rollup = str(rollups[-1])
    blocked = sum(1 for row in suites if int(dict(row.get("summary", {}) or {}).get("blocked", 0) or 0) > 0)
    return {
        "suiteCount": len(suites),
        "blockedSuites": blocked,
        "promotableSuites": max(0, len(suites) - blocked),
        "latestRollup": latest_rollup,
        "suites": suites,
    }


def promote_objective_run(run_id: str, state_root: Path, allow_push: bool = False, require_allow_token: bool = True) -> dict[str, Any]:
    run_dir = state_root / "runs" / run_id
    manifest = load_json(run_dir / "manifest.json")
    gate = load_json(run_dir / "gate-report.json")
    results = load_json(run_dir / "results.json")
    if not bool(gate.get("ok", False)):
        return {"ok": False, "reason": "run_not_promotable"}
    if require_allow_token:
        allow_check = verify_allow_token(run_id, state_root)
        if not allow_check.get("ok"):
            return {"ok": False, "reason": "allow_token_required", "allow": allow_check}
    workspace = Path(str(manifest["workspace"]))
    if not workspace.exists():
        return {"ok": False, "reason": "workspace_missing"}
    if not (workspace / ".git").exists() and not (workspace / ".git").is_file():
        git_dir = shutil.which("git")
        if git_dir is None:
            return {"ok": False, "reason": "git_unavailable"}
    state_prefix = ""
    try:
        state_prefix = str(state_root.relative_to(workspace)).replace("\\", "/").rstrip("/") + "/"
    except ValueError:
        state_prefix = ""
    status_check = [
        path for path in list_changed_files(workspace)
        if not state_prefix or not path.replace("\\", "/").startswith(state_prefix)
    ]
    if not status_check:
        # Allow commit attempt only if there is a patch artifact from the run, otherwise promotion is likely a no-op.
        patch_path = run_dir / "workspace.patch"
        if not patch_path.exists() or not patch_path.read_text(encoding="utf-8").strip():
            return {"ok": False, "reason": "no_changes_to_promote"}
    payload = promote_run(workspace, run_id, str(results.get("summary", manifest.get("objective_name", "run"))), push=allow_push)
    write_json(run_dir / "promotion.json", payload)
    update_manifest(run_dir, manifest, status="promoted")
    return payload


def list_objectives(config_root: Path) -> dict[str, Any]:
    objectives = []
    suites = []
    for path in objective_files(config_root):
        payload = load_json(path)
        objectives.append({"file": path.name, "name": str(payload.get("name", path.stem)), "adapter": str(payload.get("adapter", ""))})
    for path in suite_files(config_root):
        payload = load_json(path)
        suites.append({"file": path.name, "name": str(payload.get("name", path.stem)), "count": len(list(payload.get("objectives", []) or []))})
    return {"configRoot": str(config_root), "objectives": objectives, "suites": suites}


def cleanup_state(state_root: Path, keep_runs: int = 20) -> dict[str, Any]:
    runs_root = state_root / "runs"
    suites_root = state_root / "suites"
    workspaces_root = state_root / "workspaces"
    removed_runs: list[str] = []
    removed_workspaces: list[str] = []
    run_dirs = sorted((path for path in runs_root.iterdir() if path.is_dir()), key=lambda p: p.stat().st_mtime, reverse=True) if runs_root.exists() else []
    for path in run_dirs[keep_runs:]:
        shutil.rmtree(path, ignore_errors=True)
        removed_runs.append(path.name)
    workspace_dirs = sorted((path for path in workspaces_root.iterdir() if path.is_dir()), key=lambda p: p.stat().st_mtime, reverse=True) if workspaces_root.exists() else []
    valid_names = {path.name for path in run_dirs[:keep_runs]}
    for path in workspace_dirs:
        if path.name not in valid_names:
            shutil.rmtree(path, ignore_errors=True)
            removed_workspaces.append(path.name)
    removed_suite_artifacts: list[str] = []
    if suites_root.exists():
        suite_files_sorted = sorted((path for path in suites_root.glob("*") if path.is_file()), key=lambda p: p.stat().st_mtime, reverse=True)
        for path in suite_files_sorted[max(10, keep_runs):]:
            if path.name == "summary.md":
                continue
            path.unlink(missing_ok=True)
            removed_suite_artifacts.append(path.name)
    return {"removedRuns": removed_runs, "removedWorkspaces": removed_workspaces, "removedSuiteArtifacts": removed_suite_artifacts}


__all__ = [
    "prepare_run",
    "execute_run",
    "evaluate_run_gate",
    "run_objective",
    "run_suite",
    "run_all_suites",
    "list_runs",
    "show_run",
    "suite_status",
    "operator_status",
    "promote_objective_run",
    "build_objective_trend",
    "build_promotion_summary",
    "build_suite_trend",
    "load_champions",
    "load_history",
    "load_suite_champions",
    "list_objectives",
    "cleanup_state",
]
