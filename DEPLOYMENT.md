# Aetherion frontend deployment

The release artifact serves the read-only Aetherion preview. It includes the
Vite build, `server-redirect.js`, and a separate locked Express/Helmet runtime.
It has no database, payments, signing, custody, or exchange service.

## Build and review

Use Node 22 and `npm ci --ignore-scripts`. Run `npm run qa:local`,
`npm run check:wallet`, `npm run build`, and `WALLET_BUILD_SMOKE=1 npm run test:frontend`.
Install Chromium with `npx playwright install chromium --only-shell` and run
`npm run test:browser`. Use `npm run test:deployment` for the local release-gate
regressions. The wallet workflow runs these checks and audits the isolated
runtime before packaging. The package is smoke-tested after a clean runtime install.

Pull requests and pushes to `main` build and test only. The traditional-server
and legacy sync-and-deploy workflows are retired. The separate frontend sync
workflow remains a cross-repository sync and does not authorize a release.

## Configure environments before dispatch

Create `staging` and `production` GitHub environments with distinct hosts and
credentials. Restrict deployments to `main` and configure required reviewers for
production. Set the following as environment secrets and variable:

| Name | Value |
| --- | --- |
| `SSH_PRIVATE_KEY` | Dedicated deployment key with access only to the intended host |
| `DEPLOY_SSH_HOST`, `DEPLOY_SSH_USER` | Host and dedicated deployment account |
| `DEPLOY_SSH_PORT` | SSH port, defaults to 22 |
| `DEPLOY_KNOWN_HOSTS` | Host's public known_hosts entry independently verified against the host fingerprint, with `[host]:port` for non-default ports |
| `DEPLOY_HTTPS_ORIGIN` (variable) | HTTPS origin serving the Aetherion preview, without a path |

The host needs Node 22, npm, a configured TLS reverse proxy, and a pre-existing
`aetherion` systemd unit running the deployment account's
`aetherion_current/server-redirect.js` with `NODE_ENV=production`. Scope the
account's noninteractive sudo permissions to restarting, checking, and stopping
this unit. Provision the service and verify TLS and the SSH fingerprint through
an independent trusted channel. The workflow does not provision the host.

## Release and verify

After review, run **Aetherion Wallet Deployment** manually on `main`, select
`staging`, and set `confirm_deploy` to true. The job installs the locked runtime
into a new release directory, switches the `aetherion_current` symlink, and
verifies the exact commit, frontend health, `/wallet`, `/dapp`, and linked assets
over HTTPS. Missing assets must return 404; financial API prefixes must return
503. The verifier fails on redirects, wrong content types, or a different release
SHA. A failed restart or probe attempts to restore the previous release and fails
the job. Inspect the prior link and service state if rollback fails.

Repeat with `production` only after staging passes and an authorized reviewer
approves the production environment. Production also requires the root
dependency audit to pass at the high severity threshold; the isolated runtime
passing its own audit does not waive that gate. Neither passing CI nor this guide certifies
live deployment, cryptographic safety, or financial functionality.
