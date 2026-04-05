from __future__ import annotations

from pathlib import Path
from typing import Any

from .common import load_json, write_json


def _normalize_name(value: str) -> str:
    return "".join(ch if ch.isalnum() or ch in ("-", "_") else "_" for ch in str(value or "").strip()) or "unknown"


def history_root(state_root: Path) -> Path:
    return state_root / "history"


def history_file(state_root: Path, objective_name: str) -> Path:
    return history_root(state_root) / f"{_normalize_name(objective_name)}.json"


def champions_file(state_root: Path) -> Path:
    return history_root(state_root) / "champions.json"


def history_runs_dir(state_root: Path, objective_name: str) -> Path:
    return history_root(state_root) / _normalize_name(objective_name)


def suite_champions_file(state_root: Path) -> Path:
    return history_root(state_root) / "suite-champions.json"


def _scan_objective_runs(state_root: Path, objective_name: str) -> list[dict[str, Any]]:
    runs_root = state_root / "runs"
    rows: list[dict[str, Any]] = []
    objective_name = str(objective_name or "").strip()
    for manifest_path in runs_root.glob("*/manifest.json"):
        run_dir = manifest_path.parent
        try:
            manifest = load_json(manifest_path)
        except Exception:
            continue
        if str(manifest.get("objective_name", "")).strip() != objective_name:
            continue
        results_path = run_dir / "results.json"
        gate_path = run_dir / "gate-report.json"
        results = load_json(results_path) if results_path.exists() else {}
        gate = load_json(gate_path) if gate_path.exists() else {}
        rows.append(
            {
                "runId": str(manifest.get("run_id", run_dir.name)),
                "objective": objective_name,
                "status": str(manifest.get("status", "")),
                "verdict": str(gate.get("verdict", "blocked" if results.get("failed") else "")),
                "candidateMetric": float(results.get("candidate_metric", 0.0) or 0.0),
                "summary": str(results.get("summary", "")),
                "createdAtMs": int(manifest.get("created_at_ms", 0) or 0),
            }
        )
    return rows


def load_history(state_root: Path, objective_name: str) -> dict[str, Any]:
    runs_dir = history_runs_dir(state_root, objective_name)
    path = history_file(state_root, objective_name)
    runs: list[dict[str, Any]] = _scan_objective_runs(state_root, objective_name)
    if path.exists():
        payload = load_json(path)
        runs.extend([row for row in list(payload.get("runs", []) or []) if isinstance(row, dict)])
    if runs_dir.exists():
        for child in sorted(runs_dir.glob("*.json")):
            try:
                payload = load_json(child)
            except Exception:
                continue
            if isinstance(payload, dict):
                runs.append(payload)
    if not runs:
        return {"objective": objective_name, "runs": []}
    runs.sort(key=lambda row: (int(row.get("createdAtMs", 0) or 0), str(row.get("runId", ""))))
    deduped: list[dict[str, Any]] = []
    seen: set[str] = set()
    for row in runs:
        run_id = str(row.get("runId", ""))
        if run_id in seen:
            continue
        seen.add(run_id)
        deduped.append(row)
    return {"objective": objective_name, "runs": deduped[-50:]}


def append_history(state_root: Path, objective_name: str, entry: dict[str, Any]) -> dict[str, Any]:
    run_id = str(entry.get("runId", "")).strip() or "unknown"
    write_json(history_runs_dir(state_root, objective_name) / f"{run_id}.json", entry)
    payload = load_history(state_root, objective_name)
    write_json(history_file(state_root, objective_name), payload)
    return payload


def load_champions(state_root: Path) -> dict[str, Any]:
    path = champions_file(state_root)
    return load_json(path) if path.exists() else {"objectives": {}}


def update_champion(state_root: Path, objective_name: str, entry: dict[str, Any]) -> dict[str, Any]:
    path = champions_file(state_root)
    payload = load_champions(state_root)
    objectives = dict(payload.get("objectives", {}) or {})
    current = dict(objectives.get(objective_name, {}) or {})
    candidate = float(entry.get("candidateMetric", 0.0) or 0.0)
    current_metric = float(current.get("candidateMetric", float("inf")) or float("inf"))
    verdict = str(entry.get("verdict", "blocked"))
    should_replace = not current or (
        verdict == "promotable" and (str(current.get("verdict", "blocked")) != "promotable" or candidate <= current_metric)
    )
    if should_replace:
        objectives[objective_name] = dict(entry)
    payload["objectives"] = objectives
    write_json(path, payload)
    return payload


def build_objective_trend(state_root: Path, objective_name: str, limit: int = 10) -> dict[str, Any]:
    payload = load_history(state_root, objective_name)
    runs = list(payload.get("runs", []) or [])[-max(1, int(limit)) :]
    champion = dict((load_champions(state_root).get("objectives", {}) or {}).get(objective_name, {}) or {})
    latest = dict(runs[-1]) if runs else {}
    previous = dict(runs[-2]) if len(runs) > 1 else {}
    latest_metric = float(latest.get("candidateMetric", 0.0) or 0.0) if latest else 0.0
    previous_metric = float(previous.get("candidateMetric", 0.0) or 0.0) if previous else 0.0
    champion_metric = float(champion.get("candidateMetric", 0.0) or 0.0) if champion else 0.0
    delta_prev = latest_metric - previous_metric if latest and previous else None
    delta_champion = latest_metric - champion_metric if latest and champion else None
    return {
        "objective": objective_name,
        "latest": latest,
        "previous": previous,
        "champion": champion,
        "runCount": len(payload.get("runs", []) or []),
        "window": runs,
        "deltaFromPrevious": delta_prev,
        "deltaFromChampion": delta_champion,
        "improvedVsPrevious": bool(delta_prev is not None and delta_prev <= 0),
        "matchedChampion": bool(champion and latest and str(champion.get("runId", "")) == str(latest.get("runId", ""))),
    }


def build_promotion_summary(state_root: Path, objective_name: str) -> dict[str, Any]:
    trend = build_objective_trend(state_root, objective_name)
    latest = dict(trend.get("latest", {}) or {})
    champion = dict(trend.get("champion", {}) or {})
    return {
        "objective": objective_name,
        "latestRunId": str(latest.get("runId", "")),
        "latestVerdict": str(latest.get("verdict", "")),
        "latestMetric": float(latest.get("candidateMetric", 0.0) or 0.0) if latest else 0.0,
        "championRunId": str(champion.get("runId", "")),
        "championMetric": float(champion.get("candidateMetric", 0.0) or 0.0) if champion else 0.0,
        "deltaFromChampion": trend.get("deltaFromChampion"),
        "deltaFromPrevious": trend.get("deltaFromPrevious"),
        "improvedVsPrevious": bool(trend.get("improvedVsPrevious", False)),
        "matchedChampion": bool(trend.get("matchedChampion", False)),
        "runCount": int(trend.get("runCount", 0) or 0),
    }


def load_suite_champions(state_root: Path) -> dict[str, Any]:
    path = suite_champions_file(state_root)
    return load_json(path) if path.exists() else {"suites": {}}


def update_suite_champion(state_root: Path, entry: dict[str, Any]) -> dict[str, Any]:
    path = suite_champions_file(state_root)
    payload = load_suite_champions(state_root)
    suites = dict(payload.get("suites", {}) or {})
    suite_name = str(entry.get("suite", "")).strip()
    summary = dict(entry.get("summary", {}) or {})
    current = dict(suites.get(suite_name, {}) or {})
    promotable = int(summary.get("promotable", 0) or 0)
    blocked = int(summary.get("blocked", 0) or 0)
    current_summary = dict(current.get("summary", {}) or {})
    current_promotable = int(current_summary.get("promotable", -1) or -1)
    current_blocked = int(current_summary.get("blocked", 1_000_000) or 1_000_000)
    should_replace = not current or blocked < current_blocked or (blocked == current_blocked and promotable >= current_promotable)
    if should_replace:
        suites[suite_name] = dict(entry)
    payload["suites"] = suites
    write_json(path, payload)
    return payload


def load_suite_history(state_root: Path, suite_name: str) -> dict[str, Any]:
    suite_dir = state_root / "suites"
    rows: list[dict[str, Any]] = []
    if suite_dir.exists():
        for path in sorted(suite_dir.glob(f"*-{suite_name}.json")):
            try:
                payload = load_json(path)
            except Exception:
                continue
            if isinstance(payload, dict):
                payload.setdefault("artifact", str(path))
                rows.append(payload)
    rows.sort(key=lambda row: (int(row.get("startedAtMs", 0) or 0), str(row.get("suite", ""))))
    return {"suite": suite_name, "runs": rows[-50:]}


def build_suite_trend(state_root: Path, suite_name: str, limit: int = 10) -> dict[str, Any]:
    payload = load_suite_history(state_root, suite_name)
    runs = list(payload.get("runs", []) or [])[-max(1, int(limit)) :]
    latest = dict(runs[-1]) if runs else {}
    previous = dict(runs[-2]) if len(runs) > 1 else {}
    champion = dict((load_suite_champions(state_root).get("suites", {}) or {}).get(suite_name, {}) or {})
    latest_summary = dict(latest.get("summary", {}) or {})
    previous_summary = dict(previous.get("summary", {}) or {})
    champion_summary = dict(champion.get("summary", {}) or {})
    latest_promotable = int(latest_summary.get("promotable", 0) or 0)
    previous_promotable = int(previous_summary.get("promotable", 0) or 0)
    latest_blocked = int(latest_summary.get("blocked", 0) or 0)
    previous_blocked = int(previous_summary.get("blocked", 0) or 0)
    champion_promotable = int(champion_summary.get("promotable", 0) or 0) if champion else 0
    champion_blocked = int(champion_summary.get("blocked", 0) or 0) if champion else 0
    return {
        "suite": suite_name,
        "latest": latest,
        "previous": previous,
        "champion": champion,
        "runCount": len(payload.get("runs", []) or []),
        "window": runs,
        "deltaPromotable": latest_promotable - previous_promotable if previous else None,
        "deltaBlocked": latest_blocked - previous_blocked if previous else None,
        "deltaPromotableFromChampion": latest_promotable - champion_promotable if champion else None,
        "deltaBlockedFromChampion": latest_blocked - champion_blocked if champion else None,
        "improvedVsPrevious": bool(previous and latest_blocked <= previous_blocked and latest_promotable >= previous_promotable),
        "matchedChampion": bool(champion and latest and str(champion.get("artifact", "")) == str(latest.get("artifact", ""))),
    }
