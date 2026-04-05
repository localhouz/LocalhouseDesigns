# GitHub Actions Setup

Use GitHub Actions as the trusted signer for allow tokens.

## What To Configure

1. Go to your repo settings in GitHub.
2. Create an environment named `trusted-gate`.
3. Add a secret named `AUTORESEARCH_GATE_SECRET` to that environment.
4. Keep `require_allow_token_for_promotion` enabled in the repo profile.

## How To Use It

From the GitHub Actions tab, run the `Trusted Gate` workflow.

Modes:

- `objective`
- `suite`
- `all`

The workflow will:

- install the tool
- run the selected gated command
- find the latest run
- issue a signed allow token
- verify the token
- upload `.autoresearch` as an artifact

## Important Trust Notes

GitHub Actions is only a trusted boundary if you also protect the workflow path and secret exposure.

Recommended:

- protect the default branch
- do not allow routine agent edits to `.github/workflows/`
- keep `.github/workflows/trusted-gate.yml` reviewed and stable
- prefer storing `AUTORESEARCH_GATE_SECRET` in the protected `trusted-gate` environment

If an agent can rewrite the workflow that receives the secret, the trust boundary is gone.
