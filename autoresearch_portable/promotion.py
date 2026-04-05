from __future__ import annotations

from pathlib import Path

from .common import current_branch, run_command


def promote_run(workspace: Path, run_id: str, summary: str, push: bool = False) -> dict[str, object]:
    branch = current_branch(workspace)
    add_result = run_command(["git", "add", "-A"], cwd=workspace)
    if add_result.returncode != 0:
        raise RuntimeError(add_result.stderr.strip() or "git add failed")
    commit_message = f"autoresearch({run_id}): {summary}"
    commit_result = run_command(["git", "commit", "-m", commit_message], cwd=workspace)
    if commit_result.returncode != 0:
        raise RuntimeError(commit_result.stderr.strip() or "git commit failed")
    push_result = None
    if push:
        push_result = run_command(["git", "push", "-u", "origin", branch], cwd=workspace)
        if push_result.returncode != 0:
            raise RuntimeError(push_result.stderr.strip() or "git push failed")
    return {
        "branch": branch,
        "commit_message": commit_message,
        "push_performed": bool(push),
        "push_stdout": "" if push_result is None else push_result.stdout[-4000:],
    }
