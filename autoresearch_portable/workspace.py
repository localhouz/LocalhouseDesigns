from __future__ import annotations

import os
import shutil
import subprocess
from hashlib import sha256
from pathlib import Path

from .common import is_git_repo, run_command


def _tracked_changes(repo_root: Path) -> list[str]:
    completed = run_command(["git", "status", "--porcelain"], cwd=repo_root)
    if completed.returncode != 0 or completed.stdout is None:
        return []
    return [line.rstrip() for line in completed.stdout.splitlines() if line.strip()]


def sync_dirty_state(repo_root: Path, workspace: Path, state_root: Path) -> list[str]:
    synced: list[str] = []
    ignored_prefixes = {
        str(state_root.name).replace("\\", "/") + "/",
        ".test-temp/",
        ".electron-profile/",
    }
    for line in _tracked_changes(repo_root):
        status = line[:2]
        path_text = line[3:]
        if " -> " in path_text:
            path_text = path_text.split(" -> ", 1)[1]
        relative = Path(path_text)
        normalized_relative = str(relative).replace("\\", "/")
        if any(normalized_relative.startswith(prefix) for prefix in ignored_prefixes):
            continue
        source = repo_root / relative
        target = workspace / relative

        if status.strip() == "D":
            if target.exists():
                if target.is_dir():
                    shutil.rmtree(target, ignore_errors=True)
                else:
                    target.unlink(missing_ok=True)
            synced.append(normalized_relative)
            continue

        if source.is_dir():
            shutil.copytree(
                source,
                target,
                dirs_exist_ok=True,
                ignore=shutil.ignore_patterns(
                    ".git",
                    "node_modules",
                    ".venv",
                    "__pycache__",
                    "dist",
                    "build",
                    state_root.name,
                    ".test-temp",
                    ".electron-profile",
                ),
            )
            synced.append(normalized_relative)
            continue

        if source.exists():
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, target)
            synced.append(normalized_relative)
    return sorted(set(synced))


def list_changed_files(workspace: Path) -> list[str]:
    if not is_git_repo(workspace):
        return []
    completed = run_command(["git", "status", "--short"], cwd=workspace)
    if completed.returncode != 0:
        return []
    rows: list[str] = []
    for line in completed.stdout.splitlines():
        if not line.strip():
            continue
        path_text = line[3:].strip()
        if " -> " in path_text:
            path_text = path_text.split(" -> ", 1)[1]
        rows.append(path_text.replace("\\", "/"))
    return sorted(set(rows))


def write_workspace_diff(workspace: Path, target: Path) -> Path | None:
    if not is_git_repo(workspace):
        return None
    completed = run_command(["git", "diff", "--binary"], cwd=workspace)
    if completed.returncode != 0:
        return None
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(completed.stdout or "", encoding="utf-8")
    return target


def snapshot_paths(workspace: Path, paths: list[str]) -> dict[str, str]:
    snapshot: dict[str, str] = {}
    for raw_path in paths:
        candidate = workspace / raw_path
        if candidate.is_dir():
            for child in candidate.rglob("*"):
                if child.is_file():
                    rel = str(child.relative_to(workspace)).replace("\\", "/")
                    snapshot[rel] = sha256(child.read_bytes()).hexdigest()
        elif candidate.is_file():
            rel = str(candidate.relative_to(workspace)).replace("\\", "/")
            snapshot[rel] = sha256(candidate.read_bytes()).hexdigest()
    return snapshot


def diff_snapshot(workspace: Path, baseline_snapshot: dict[str, str], paths: list[str]) -> list[str]:
    current_snapshot = snapshot_paths(workspace, paths)
    changed: list[str] = []
    keys = set(baseline_snapshot.keys()) | set(current_snapshot.keys())
    for key in sorted(keys):
        if baseline_snapshot.get(key) != current_snapshot.get(key):
            changed.append(key)
    return changed


def prepare_workspace(repo_root: Path, state_root: Path, run_id: str, mode: str) -> Path:
    workspaces_root = state_root / "workspaces"
    workspaces_root.mkdir(parents=True, exist_ok=True)

    if mode == "in_place":
        return repo_root

    if mode == "scratch":
        target = workspaces_root / run_id
        if target.exists():
            shutil.rmtree(target)
        shutil.copytree(
            repo_root,
            target,
            ignore=shutil.ignore_patterns(".git", "node_modules", ".venv", "__pycache__", "dist", "build", ".autoresearch"),
        )
        return target

    if mode == "worktree":
        if not is_git_repo(repo_root):
            raise RuntimeError("workspace_mode=worktree requires a git repository")
        target = workspaces_root / run_id
        if target.exists():
            sync_dirty_state(repo_root, target, state_root)
            return target
        branch_name = f"autoresearch/{run_id}"
        completed = subprocess.run(
            ["git", "worktree", "add", "-b", branch_name, str(target), "HEAD"],
            cwd=str(repo_root),
            env={**os.environ, "GIT_TERMINAL_PROMPT": "0"},
            capture_output=True,
            text=True,
            check=False,
        )
        if completed.returncode != 0:
            raise RuntimeError(completed.stderr.strip() or "git worktree add failed")
        sync_dirty_state(repo_root, target, state_root)
        return target

    raise ValueError(f"Unsupported workspace mode: {mode}")
