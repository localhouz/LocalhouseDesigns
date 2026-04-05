from __future__ import annotations

import hashlib
import hmac
import json
import os
import time
from pathlib import Path
from typing import Any

from .common import load_json, write_json


def _file_sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _secret() -> str | None:
    value = os.environ.get("AUTORESEARCH_GATE_SECRET", "").strip()
    return value or None


def _token_payload(run_dir: Path) -> dict[str, Any]:
    manifest_path = run_dir / "manifest.json"
    results_path = run_dir / "results.json"
    gate_path = run_dir / "gate-report.json"
    manifest = load_json(manifest_path)
    results = load_json(results_path)
    gate = load_json(gate_path)
    return {
        "runId": str(manifest.get("run_id", run_dir.name)),
        "objective": str(manifest.get("objective_name", "")),
        "verdict": str(gate.get("verdict", "")),
        "ok": bool(gate.get("ok", False)),
        "candidateMetric": float(results.get("candidate_metric", 0.0) or 0.0),
        "manifestSha256": _file_sha256(manifest_path),
        "resultsSha256": _file_sha256(results_path),
        "gateSha256": _file_sha256(gate_path),
    }


def _signature(payload: dict[str, Any], secret: str) -> str:
    message = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hmac.new(secret.encode("utf-8"), message, hashlib.sha256).hexdigest()


def issue_allow_token(run_id: str, state_root: Path) -> dict[str, Any]:
    secret = _secret()
    if not secret:
        return {"ok": False, "reason": "missing_gate_secret"}
    run_dir = state_root / "runs" / run_id
    gate_path = run_dir / "gate-report.json"
    if not gate_path.exists():
        return {"ok": False, "reason": "missing_gate_report"}
    gate = load_json(gate_path)
    if not bool(gate.get("ok", False)):
        return {"ok": False, "reason": "run_not_promotable"}
    payload = _token_payload(run_dir)
    token = {
        "type": "allow_token",
        "issuedAtMs": int(time.time() * 1000),
        "payload": payload,
        "signature": _signature(payload, secret),
    }
    write_json(run_dir / "allow-token.json", token)
    return {"ok": True, "tokenPath": str(run_dir / "allow-token.json"), "payload": payload}


def verify_allow_token(run_id: str, state_root: Path) -> dict[str, Any]:
    secret = _secret()
    if not secret:
        return {"ok": False, "reason": "missing_gate_secret"}
    run_dir = state_root / "runs" / run_id
    token_path = run_dir / "allow-token.json"
    if not token_path.exists():
        return {"ok": False, "reason": "missing_allow_token"}
    token = load_json(token_path)
    payload = dict(token.get("payload", {}) or {})
    if str(payload.get("runId", "")) != run_id:
        return {"ok": False, "reason": "run_id_mismatch"}
    expected = _token_payload(run_dir)
    if payload != expected:
        return {"ok": False, "reason": "token_payload_mismatch", "expected": expected, "actual": payload}
    signature = str(token.get("signature", ""))
    if not hmac.compare_digest(signature, _signature(payload, secret)):
        return {"ok": False, "reason": "invalid_signature"}
    return {"ok": True, "payload": payload, "tokenPath": str(token_path)}
