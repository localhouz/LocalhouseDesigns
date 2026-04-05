from __future__ import annotations

import argparse
import json
from pathlib import Path

from .allow_gate import issue_allow_token, verify_allow_token
from .common import bundled_template_text, default_config_root, default_profile_path, default_repo_root, default_state_root, load_profile, profile_lookup, resolve_profile_alias, shell_health
from .adapters import list_adapters
from .runner import (
    build_objective_trend,
    build_promotion_summary,
    build_suite_trend,
    cleanup_state,
    evaluate_run_gate,
    execute_run,
    list_runs,
    list_objectives,
    load_champions,
    load_history,
    load_suite_champions,
    operator_status,
    prepare_run,
    promote_objective_run,
    run_all_suites,
    run_objective,
    run_suite,
    show_run,
    suite_status,
)


def sync_templates(repo_root: Path, force: bool = False) -> dict[str, object]:
    state_root = default_state_root(repo_root)
    state_root.mkdir(parents=True, exist_ok=True)
    templates = {
        "templates/autoresearch.profile.json": "autoresearch.profile.json",
        "templates/objective.example.json": "objective.example.json",
        "templates/objective.smoke.json": "objective.smoke.json",
        "templates/suite.example.json": "suite.example.json",
        "templates/repo_policy.example.json": "repo_policy.example.json",
    }
    copied: list[str] = []
    skipped: list[str] = []
    for relative, source_name in templates.items():
        target = repo_root / relative
        if target.exists() and not force:
            skipped.append(str(target))
            continue
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(bundled_template_text(source_name), encoding="utf-8")
        copied.append(str(target))
    return {"ok": True, "repoRoot": str(repo_root), "stateRoot": str(state_root), "copied": copied, "skipped": skipped, "force": force}


def command_bootstrap(repo_root: Path, force: bool = False) -> int:
    print(json.dumps(sync_templates(repo_root, force=force), indent=2))
    return 0


def profile_default(args: argparse.Namespace, key: str) -> str | None:
    profile = load_profile(args.repo_root, args.profile)
    return profile_lookup(profile, key)


def resolved_objective_arg(args: argparse.Namespace) -> str | None:
    profile = load_profile(args.repo_root, args.profile)
    candidate = getattr(args, "objective", None) or profile_lookup(profile, "default_objective")
    return resolve_profile_alias(profile, "objective_aliases", candidate)


def resolved_suite_arg(args: argparse.Namespace) -> str | None:
    profile = load_profile(args.repo_root, args.profile)
    candidate = getattr(args, "suite", None) or profile_lookup(profile, "default_suite")
    return resolve_profile_alias(profile, "suite_aliases", candidate)


def resolve_policy_arg(args: argparse.Namespace) -> str:
    if getattr(args, "policy", None):
        return str(args.policy)
    policy = profile_default(args, "default_policy")
    if policy:
        return policy
    return "repo_policy.example.json"


def ensure_agent_bootstrap(repo_root: Path, profile_path: Path | None, force_sync: bool = False) -> dict[str, object]:
    profile = load_profile(repo_root, profile_path)
    auto_bootstrap = bool(profile.get("auto_bootstrap_templates", True))
    auto_sync = bool(profile.get("auto_sync_templates", False))
    templates_root = repo_root / "templates"
    needs_bootstrap = not templates_root.exists() or not (templates_root / "autoresearch.profile.json").exists()
    if force_sync or (auto_bootstrap and needs_bootstrap) or auto_sync:
        return sync_templates(repo_root, force=bool(force_sync or auto_sync))
    return {"ok": True, "repoRoot": str(repo_root), "stateRoot": str(default_state_root(repo_root)), "copied": [], "skipped": [], "force": False}


def agent_ready_payload(args: argparse.Namespace) -> dict[str, object]:
    sync_payload = ensure_agent_bootstrap(args.repo_root, args.profile)
    profile = load_profile(args.repo_root, args.profile)
    health = shell_health(args.repo_root)
    objective = resolved_objective_arg(args)
    suite = resolved_suite_arg(args)
    policy = resolve_policy_arg(args)
    agent_default_command = profile_lookup(profile, "agent_default_command") or "auto"
    discovered = list_objectives(args.config_root)
    return {
        "ok": bool(health.get("ok")),
        "health": health,
        "bootstrap": sync_payload,
        "profile": profile,
        "resolved": {
            "policy": policy,
            "objective": objective,
            "suite": suite,
            "defaultCommand": agent_default_command,
        },
        "discovered": discovered,
        "canRun": bool(health.get("ok")) and bool(objective or suite or discovered.get("suites") or discovered.get("objectives")),
    }


def run_agent_mode(args: argparse.Namespace) -> tuple[dict[str, object], int]:
    ready = agent_ready_payload(args)
    if not ready.get("ok"):
        return {"ok": False, "stage": "health", "ready": ready}, 1

    profile = dict(ready.get("profile", {}) or {})
    mode = getattr(args, "mode", None) or profile_lookup(profile, "agent_default_command") or "auto"
    resolved = dict(ready.get("resolved", {}) or {})
    policy = str(resolved.get("policy", "repo_policy.example.json"))
    objective = resolved.get("objective")
    suite = resolved.get("suite")
    resume = bool(getattr(args, "resume", False) or profile.get("agent_resume_batches", False))
    enforce_gated_mode = bool(profile.get("agent_enforce_gated_mode", True))
    agent_workspace_mode = profile_lookup(profile, "agent_workspace_mode") or "scratch"

    # Agent mode must not mutate the main repo directly when gated mode is enforced.
    workspace_mode = agent_workspace_mode if enforce_gated_mode else (profile_lookup(profile, "default_workspace_mode") or "in_place")

    if mode == "auto":
        if objective:
            mode = "objective"
        elif suite:
            mode = "suite"
        else:
            suites_payload = dict(ready.get("discovered", {}) or {})
            if list(suites_payload.get("suites", []) or []):
                mode = "all"
            elif list(suites_payload.get("objectives", []) or []):
                first = dict(list(suites_payload.get("objectives", []) or [])[0])
                objective = str(first.get("file", ""))
                mode = "objective"
            else:
                return {"ok": False, "stage": "selection", "reason": "no_objectives_or_suites_found", "ready": ready}, 1

    if mode == "objective":
        if not objective:
            return {"ok": False, "stage": "selection", "reason": "no_default_objective", "ready": ready}, 1
        payload = run_objective(str(objective), policy, args.config_root, args.repo_root, args.state_root, workspace_mode)
        return {
            "ok": payload["verdict"] == "promotable",
            "mode": mode,
            "gated": True,
            "workspaceMode": workspace_mode,
            "payload": payload,
            "ready": ready,
        }, 0 if payload["verdict"] == "promotable" else 1

    if mode == "suite":
        if not suite:
            return {"ok": False, "stage": "selection", "reason": "no_default_suite", "ready": ready}, 1
        payload = run_suite(str(suite), policy, args.config_root, args.repo_root, args.state_root, workspace_mode=workspace_mode)
        blocked = int(dict(payload.get("summary", {}) or {}).get("blocked", 0) or 0)
        return {"ok": blocked == 0, "mode": mode, "gated": True, "workspaceMode": workspace_mode, "payload": payload, "ready": ready}, 0 if blocked == 0 else 1

    if mode == "all":
        payload = run_all_suites(policy, args.config_root, args.repo_root, args.state_root, resume=resume, workspace_mode=workspace_mode)
        ok = int(payload.get("promotableSuites", 0) or 0) == int(payload.get("completedSuites", 0) or 0)
        return {"ok": ok, "mode": mode, "gated": True, "workspaceMode": workspace_mode, "payload": payload, "ready": ready}, 0 if ok else 1

    return {"ok": False, "stage": "selection", "reason": f"unsupported_agent_mode:{mode}", "ready": ready}, 1


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="portable_autoresearch")
    parser.add_argument("--repo-root", type=Path, default=default_repo_root())
    parser.add_argument("--config-root", type=Path, default=default_config_root())
    parser.add_argument("--state-root", type=Path, default=None)
    parser.add_argument("--profile", type=Path, default=None)
    sub = parser.add_subparsers(dest="command", required=True)
    bootstrap = sub.add_parser("bootstrap")
    bootstrap.add_argument("--force", action="store_true")
    sync = sub.add_parser("sync-templates")
    sync.add_argument("--force", action="store_true")
    sub.add_parser("shell-health")
    sub.add_parser("list-objectives")
    sub.add_parser("list-adapters")
    sub.add_parser("show-profile")
    sub.add_parser("agent-ready")
    agent_run = sub.add_parser("agent-run")
    agent_run.add_argument("--mode", choices=["auto", "objective", "suite", "all"], default="auto")
    agent_run.add_argument("--resume", action="store_true")
    cleanup = sub.add_parser("cleanup")
    cleanup.add_argument("--keep-runs", type=int, default=None)
    prepare = sub.add_parser("prepare-run")
    prepare.add_argument("--objective")
    prepare.add_argument("--workspace-mode", default=None)
    execute = sub.add_parser("execute-run")
    execute.add_argument("--run-id", required=True)
    gate = sub.add_parser("evaluate-gate")
    gate.add_argument("--run-id", required=True)
    gate.add_argument("--policy")
    issue_allow = sub.add_parser("issue-allow")
    issue_allow.add_argument("--run-id", required=True)
    verify_allow = sub.add_parser("verify-allow")
    verify_allow.add_argument("--run-id", required=True)
    promote = sub.add_parser("promote-run")
    promote.add_argument("--run-id", required=True)
    promote.add_argument("--allow-push", action="store_true")
    run_obj = sub.add_parser("run-objective")
    run_obj.add_argument("--objective")
    run_obj.add_argument("--policy")
    run_obj.add_argument("--workspace-mode", default=None)
    run_suite_cmd = sub.add_parser("run-suite")
    run_suite_cmd.add_argument("--suite")
    run_suite_cmd.add_argument("--policy")
    run_all = sub.add_parser("run-all-suites")
    run_all.add_argument("--policy")
    run_all.add_argument("--resume", action="store_true")
    sub.add_parser("list-runs")
    show = sub.add_parser("show-run")
    show.add_argument("--run-id", required=True)
    sub.add_parser("show-champions")
    sub.add_parser("show-suite-champions")
    history = sub.add_parser("show-objective-history")
    history.add_argument("--objective", required=True)
    obj_trend = sub.add_parser("show-objective-trend")
    obj_trend.add_argument("--objective", required=True)
    obj_trend.add_argument("--limit", type=int, default=10)
    suite_trend = sub.add_parser("show-suite-trend")
    suite_trend.add_argument("--suite", required=True)
    suite_trend.add_argument("--limit", type=int, default=10)
    promo_summary = sub.add_parser("promotion-summary")
    promo_summary.add_argument("--objective", required=True)
    sub.add_parser("suite-status")
    sub.add_parser("operator-status")
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    args.repo_root = Path(args.repo_root).resolve()
    requested_config_root = Path(args.config_root).resolve()
    args.state_root = Path(args.state_root).resolve() if args.state_root else default_state_root(args.repo_root)
    args.profile = Path(args.profile).resolve() if args.profile else default_profile_path(args.repo_root)
    repo_templates = args.repo_root / "templates"
    source_default_templates = default_config_root().resolve()
    if requested_config_root == source_default_templates and repo_templates.exists():
        args.config_root = repo_templates.resolve()
    else:
        args.config_root = requested_config_root

    if args.command == "bootstrap":
        return command_bootstrap(args.repo_root, force=bool(args.force))
    if args.command == "sync-templates":
        print(json.dumps(sync_templates(args.repo_root, force=bool(args.force)), indent=2))
        return 0
    if args.command == "shell-health":
        payload = shell_health(args.repo_root)
        print(json.dumps(payload, indent=2))
        return 0 if payload.get("ok") else 1
    if args.command == "show-profile":
        print(json.dumps(load_profile(args.repo_root, args.profile), indent=2))
        return 0
    if args.command == "agent-ready":
        payload = agent_ready_payload(args)
        print(json.dumps(payload, indent=2))
        return 0 if payload.get("ok") and payload.get("canRun") else 1
    if args.command == "agent-run":
        payload, code = run_agent_mode(args)
        print(json.dumps(payload, indent=2))
        return code
    if args.command == "list-objectives":
        print(json.dumps(list_objectives(args.config_root), indent=2))
        return 0
    if args.command == "list-adapters":
        print(json.dumps({"adapters": list_adapters()}, indent=2))
        return 0
    if args.command == "cleanup":
        keep_runs = args.keep_runs
        if keep_runs is None:
            profile = load_profile(args.repo_root, args.profile)
            keep_runs = int(profile.get("cleanup_keep_runs", 20) or 20)
        print(json.dumps(cleanup_state(args.state_root, keep_runs=keep_runs), indent=2))
        return 0
    if args.command == "prepare-run":
        objective = resolved_objective_arg(args)
        if not objective:
            parser.error("prepare-run requires --objective or profile default_objective")
        workspace_mode = args.workspace_mode or profile_default(args, "default_workspace_mode")
        print(json.dumps(prepare_run(objective, args.config_root, args.repo_root, args.state_root, workspace_mode), indent=2))
        return 0
    if args.command == "execute-run":
        results = execute_run(args.run_id, args.state_root)
        print(json.dumps(results, indent=2))
        return 0 if not results.get("failed") else 1
    if args.command == "evaluate-gate":
        _, gate = evaluate_run_gate(args.run_id, resolve_policy_arg(args), args.config_root, args.repo_root, args.state_root)
        print(json.dumps(gate, indent=2))
        return 0 if gate.get("ok") else 1
    if args.command == "issue-allow":
        payload = issue_allow_token(args.run_id, args.state_root)
        print(json.dumps(payload, indent=2))
        return 0 if payload.get("ok") else 1
    if args.command == "verify-allow":
        payload = verify_allow_token(args.run_id, args.state_root)
        print(json.dumps(payload, indent=2))
        return 0 if payload.get("ok") else 1
    if args.command == "promote-run":
        profile = load_profile(args.repo_root, args.profile)
        require_allow_token = bool(profile.get("require_allow_token_for_promotion", True))
        payload = promote_objective_run(args.run_id, args.state_root, allow_push=bool(args.allow_push), require_allow_token=require_allow_token)
        print(json.dumps(payload, indent=2))
        return 0 if payload.get("ok", True) else 1
    if args.command == "run-objective":
        objective = resolved_objective_arg(args)
        if not objective:
            parser.error("run-objective requires --objective or profile default_objective")
        workspace_mode = args.workspace_mode or profile_default(args, "default_workspace_mode")
        payload = run_objective(objective, resolve_policy_arg(args), args.config_root, args.repo_root, args.state_root, workspace_mode)
        print(json.dumps(payload, indent=2))
        return 0 if payload["verdict"] == "promotable" else 1
    if args.command == "run-suite":
        suite = resolved_suite_arg(args)
        if not suite:
            parser.error("run-suite requires --suite or profile default_suite")
        payload = run_suite(suite, resolve_policy_arg(args), args.config_root, args.repo_root, args.state_root)
        print(json.dumps(payload, indent=2))
        return 0 if payload["summary"]["blocked"] == 0 else 1
    if args.command == "run-all-suites":
        payload = run_all_suites(resolve_policy_arg(args), args.config_root, args.repo_root, args.state_root, resume=bool(args.resume))
        print(json.dumps(payload, indent=2))
        return 0 if payload["promotableSuites"] == payload["completedSuites"] else 1
    if args.command == "list-runs":
        print(json.dumps({"runs": list_runs(args.state_root)}, indent=2))
        return 0
    if args.command == "show-run":
        payload = show_run(args.run_id, args.state_root)
        print(json.dumps(payload, indent=2))
        return 0 if payload else 1
    if args.command == "show-champions":
        print(json.dumps(load_champions(args.state_root), indent=2))
        return 0
    if args.command == "show-suite-champions":
        print(json.dumps(load_suite_champions(args.state_root), indent=2))
        return 0
    if args.command == "show-objective-history":
        print(json.dumps(load_history(args.state_root, args.objective), indent=2))
        return 0
    if args.command == "show-objective-trend":
        print(json.dumps(build_objective_trend(args.state_root, args.objective, limit=args.limit), indent=2))
        return 0
    if args.command == "show-suite-trend":
        print(json.dumps(build_suite_trend(args.state_root, args.suite, limit=args.limit), indent=2))
        return 0
    if args.command == "promotion-summary":
        print(json.dumps(build_promotion_summary(args.state_root, args.objective), indent=2))
        return 0
    if args.command == "suite-status":
        payload = suite_status(args.state_root)
        print(json.dumps(payload, indent=2))
        return 0 if payload.get("ok") else 1
    if args.command == "operator-status":
        payload = operator_status(args.config_root, args.state_root)
        print(json.dumps(payload, indent=2))
        return 0 if int(payload.get("blockedSuites", 0) or 0) == 0 else 1
    parser.error(f"Unsupported command: {args.command}")
    return 2
