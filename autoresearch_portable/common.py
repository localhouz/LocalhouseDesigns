from __future__ import annotations

import json
import os
import shutil
import subprocess
import time
from importlib import resources
from pathlib import Path
from typing import Any

LAST_RUN_ID_BASE = ""
LAST_RUN_ID_SEQ = 0


def make_run_id() -> str:
    global LAST_RUN_ID_BASE, LAST_RUN_ID_SEQ
    now = time.time()
    base = time.strftime("%Y%m%d-%H%M%S", time.localtime(now))
    millis = int((now - int(now)) * 1000)
    run_base = f"{base}-{millis:03d}"
    if run_base == LAST_RUN_ID_BASE:
        LAST_RUN_ID_SEQ += 1
        return f"{run_base}-{LAST_RUN_ID_SEQ:02d}"
    LAST_RUN_ID_BASE = run_base
    LAST_RUN_ID_SEQ = 0
    return run_base


def load_json(path: str | Path) -> dict[str, Any]:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def write_json(path: str | Path, payload: dict[str, Any]) -> None:
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def script_root() -> Path:
    return Path(__file__).resolve().parent.parent


def default_repo_root() -> Path:
    return Path.cwd()


def default_config_root() -> Path:
    return script_root() / "templates"


def default_state_root(repo_root: Path) -> Path:
    return repo_root / ".autoresearch"


def default_profile_path(repo_root: Path) -> Path:
    return repo_root / "templates" / "autoresearch.profile.json"


def resolve_config_path(value: str | Path, config_root: Path, repo_root: Path) -> Path:
    path = Path(value)
    if path.is_absolute():
        return path
    cwd_candidate = Path.cwd() / path
    if cwd_candidate.exists():
        return cwd_candidate.resolve()
    repo_candidate = repo_root / path
    if repo_candidate.exists():
        return repo_candidate.resolve()
    config_candidate = config_root / path
    if config_candidate.exists():
        return config_candidate.resolve()
    raise FileNotFoundError(f"Config not found: {value}")


def synapse_context(repo_root: Path) -> dict[str, object]:
    synapse_root = repo_root / ".synapse"
    synapse_data = repo_root / "synapse_data"
    config_path = synapse_root / "config.json"
    return {
        "enabled": bool(synapse_root.exists() and synapse_data.exists()),
        "root": str(synapse_root),
        "config": str(config_path),
        "dataRoot": str(synapse_data),
        "chroma": str(synapse_data / "chromadb"),
    }


def git_available() -> bool:
    return shutil.which("git") is not None


def run_command(args: list[str], cwd: Path | None = None) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        args,
        cwd=str(cwd) if cwd else None,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )


def run_shell(command: str, cwd: Path, env: dict[str, str] | None = None) -> subprocess.CompletedProcess[str]:
    merged_env = dict(os.environ)
    if env:
        merged_env.update(env)
    return subprocess.run(
        command,
        cwd=str(cwd),
        env=merged_env,
        shell=True,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )


def is_git_repo(repo_root: Path) -> bool:
    if not git_available():
        return False
    completed = run_command(["git", "rev-parse", "--is-inside-work-tree"], cwd=repo_root)
    return completed.returncode == 0 and completed.stdout.strip() == "true"


def current_branch(repo_root: Path) -> str:
    completed = run_command(["git", "branch", "--show-current"], cwd=repo_root)
    return completed.stdout.strip() if completed.returncode == 0 else ""


def load_profile(repo_root: Path, profile_path: Path | None = None) -> dict[str, Any]:
    path = Path(profile_path) if profile_path else default_profile_path(repo_root)
    return load_json(path) if path.exists() else {}


def profile_lookup(profile: dict[str, Any], key: str) -> str | None:
    value = profile.get(key)
    return str(value) if value else None


def resolve_profile_alias(profile: dict[str, Any], group: str, value: str | None) -> str | None:
    if not value:
        return None
    aliases = dict(profile.get(group, {}) or {})
    mapped = aliases.get(value)
    return str(mapped) if mapped else value


def objective_files(config_root: Path) -> list[Path]:
    return sorted(path for path in config_root.glob("objective*.json") if path.is_file())


def suite_files(config_root: Path) -> list[Path]:
    return sorted(path for path in config_root.glob("suite*.json") if path.is_file())


def shell_health(repo_root: Path) -> dict[str, object]:
    git_ok = shutil.which("git") is not None
    python_ok = shutil.which("python") is not None
    npm_ok = shutil.which("npm") is not None or (repo_root / "node_modules").exists()
    synapse = synapse_context(repo_root)
    profile = load_profile(repo_root)
    config_root = repo_root / "templates"
    return {
        "ok": bool(git_ok and python_ok),
        "git": git_ok,
        "python": python_ok,
        "npm": npm_ok,
        "repoRoot": str(repo_root),
        "synapse": synapse,
        "profileLoaded": bool(profile),
        "configRoot": str(config_root),
        "objectiveCount": len(objective_files(config_root)) if config_root.exists() else 0,
        "suiteCount": len(suite_files(config_root)) if config_root.exists() else 0,
    }


def bundled_template_text(name: str) -> str:
    return resources.files("autoresearch_portable.resources.templates").joinpath(name).read_text(encoding="utf-8")
