# Local CLI Setup

Use this guide when preparing a local machine for main-only Aether Coin Biozoecurrency development.

## Required tools

- Git
- Node.js LTS
- npm
- Python 3
- GitHub CLI, optional but recommended

## Linux or macOS

Run:

```bash
bash scripts/setup-local-dev.sh
```

Then verify:

```bash
git --version
node --version
npm --version
python3 --version
gh --version
```

## Windows

Install these tools from their official installers or a trusted package manager:

- Git for Windows
- Node.js LTS
- Python 3
- GitHub CLI

Then open PowerShell in the repository and verify:

```powershell
git --version
node --version
npm --version
python --version
gh --version
```

## GitHub authentication

If GitHub CLI is installed, authenticate locally with:

```bash
gh auth login
```

Use your own GitHub account and approved repository access.

## First local repository checks

```bash
node scripts/run-local-federation-checks.mjs
npm install
npm run qa:local
npm run check
npm run build
```

## Main-only workflow

This repository intentionally uses main-only development during the early foundation stage.

```bash
git checkout main
git pull origin main
```

Make small commits directly on `main` only when you are ready to publish.
