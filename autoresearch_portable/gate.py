from __future__ import annotations

import fnmatch
from typing import Any


def _read_dotted(payload: dict[str, Any], key_path: str) -> Any:
    current: Any = payload
    for part in key_path.split("."):
        if not isinstance(current, dict):
            raise KeyError(f"Cannot descend into non-dict value at '{part}'")
        current = current[part]
    return current


def _matches_scope(path: str, allowed_prefixes: list[str]) -> bool:
    normalized = path.replace("\\", "/")
    for prefix in allowed_prefixes:
        if fnmatch.fnmatch(normalized, prefix) or normalized.startswith(prefix.rstrip("*")):
            return True
    return False


def evaluate_gate(
    objective: dict[str, Any],
    results: dict[str, Any],
    repo_policy: dict[str, Any] | None = None,
    changed_files: list[str] | None = None,
) -> dict[str, Any]:
    reasons: list[str] = []
    checks: list[dict[str, Any]] = []

    if results.get("failed"):
        reasons.append("objective_failed")

    metric_payload = dict(results.get("metricPayload", {}) or {})
    for check in list(((objective.get("gate") or {}).get("metric_checks", []) or [])):
        label = str(check.get("label", check.get("path", "metric_check")))
        path = str(check["path"])
        op = str(check.get("op", "<="))
        target = float(check["value"])
        try:
            actual = float(_read_dotted(metric_payload, path))
        except (KeyError, TypeError, ValueError):
            reasons.append(f"metric_missing:{label}")
            checks.append({"label": label, "path": path, "op": op, "target": target, "actual": None, "ok": False})
            continue
        ok = actual <= target if op == "<=" else actual >= target
        checks.append({"label": label, "path": path, "op": op, "target": target, "actual": actual, "ok": ok})
        if not ok:
            reasons.append(f"metric_failed:{label}")

    artifacts = set(str(item) for item in list(results.get("artifacts", []) or []))
    for artifact in list(objective.get("expected_artifacts", []) or []):
        if str(artifact) not in artifacts:
            reasons.append(f"missing_artifact:{artifact}")

    policy = dict(repo_policy or {})
    allowed = list(policy.get("allowed_paths", []) or [])
    for path in list(changed_files or []):
        if allowed and not _matches_scope(path, allowed):
            reasons.append(f"forbidden_change:{path}")

    require_changes = bool((objective.get("gate") or {}).get("require_changes", False))
    if require_changes and not list(changed_files or []):
        reasons.append("no_changes_detected")

    unique_reasons = sorted(set(reasons))
    verdict = "promotable" if not unique_reasons else "blocked"
    return {
        "verdict": verdict,
        "ok": verdict == "promotable",
        "reasons": unique_reasons,
        "metricChecks": checks,
        "changedFiles": sorted(set(changed_files or [])),
    }
