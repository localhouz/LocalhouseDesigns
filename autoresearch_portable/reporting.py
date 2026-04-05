from __future__ import annotations

from pathlib import Path

from .common import write_json


def write_suite_summary(suite_dir: Path, payload: dict[str, object], trend: dict[str, object] | None = None) -> Path:
    summary = dict(payload.get("summary", {}) or {})
    lines = [
        f"# Autoresearch Suite {payload.get('suite', '')}",
        "",
        f"- total: `{summary.get('total', 0)}`",
        f"- promotable: `{summary.get('promotable', 0)}`",
        f"- blocked: `{summary.get('blocked', 0)}`",
    ]
    runs = list(payload.get("runs", []) or [])
    if runs:
        lines.extend(["", "## Runs"])
        for row in runs:
            lines.append(f"- `{row.get('objective', '')}`: `{row.get('verdict', '')}` metric=`{row.get('candidateMetric', 0)}` run=`{row.get('runId', '')}`")
    if trend:
        lines.extend(["", "## Trend"])
        lines.append(f"- improved vs previous: `{bool(trend.get('improvedVsPrevious', False))}`")
        lines.append(f"- delta promotable: `{trend.get('deltaPromotable')}`")
        lines.append(f"- delta blocked: `{trend.get('deltaBlocked')}`")
    run_tag = str(payload.get("suiteArtifactTag", "")).strip()
    suite_name = str(payload.get("suite", "suite") or "suite")
    specific_target = suite_dir / f"{run_tag}-{suite_name}.md" if run_tag else suite_dir / f"{suite_name}.md"
    specific_target.write_text("\n".join(lines) + "\n", encoding="utf-8")
    latest_target = suite_dir / "summary.md"
    latest_target.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return specific_target


def write_rollup_report(target: Path, payload: dict[str, object]) -> None:
    suites = list(payload.get("suites", []) or [])
    lines = [
        "# Autoresearch Rollup",
        "",
        f"- total suites: `{payload.get('totalSuites', len(suites))}`",
        f"- completed suites: `{payload.get('completedSuites', len(suites))}`",
        f"- promotable suites: `{payload.get('promotableSuites', 0)}`",
        f"- blocked suites: `{payload.get('blockedSuites', 0)}`",
        f"- status: `{payload.get('status', '')}`",
    ]
    if suites:
        lines.extend(["", "## Suite Results"])
        for suite in suites:
            summary = dict(suite.get("summary", {}) or {})
            lines.append(f"- `{suite.get('suite', '')}`: promotable=`{summary.get('promotable', 0)}` blocked=`{summary.get('blocked', 0)}` artifact=`{suite.get('artifact', '')}`")
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_rollup_checkpoint(state_root: Path, batch_id: str, payload: dict[str, object]) -> Path:
    suite_dir = state_root / "suites"
    suite_dir.mkdir(parents=True, exist_ok=True)
    json_path = suite_dir / f"{batch_id}-rollup.json"
    md_path = suite_dir / f"{batch_id}-rollup.md"
    write_json(json_path, payload)
    write_rollup_report(md_path, payload)
    return md_path
