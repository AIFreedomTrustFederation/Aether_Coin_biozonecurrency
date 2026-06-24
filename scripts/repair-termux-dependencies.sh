#!/usr/bin/env bash
set -euo pipefail

MODE="safe"
UPGRADE_DEPRECATED="0"
RUN_BUILD="1"
COMMIT_CHANGES="0"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --force-audit)
      MODE="force"
      shift
      ;;
    --upgrade-deprecated)
      UPGRADE_DEPRECATED="1"
      shift
      ;;
    --skip-build)
      RUN_BUILD="0"
      shift
      ;;
    --commit)
      COMMIT_CHANGES="1"
      shift
      ;;
    --help|-h)
      cat <<'HELP'
Usage: bash scripts/repair-termux-dependencies.sh [options]

Options:
  --upgrade-deprecated  Attempt direct dependency upgrades commonly linked to deprecation warnings.
  --force-audit         Run npm audit fix --force after the safe audit fix. This may introduce breaking changes.
  --skip-build          Skip npm run check and npm run build.
  --commit              Commit package/report changes directly on the current branch after checks.
  --help                Show this help.

Recommended first run:
  bash scripts/repair-termux-dependencies.sh

More aggressive run after reviewing output:
  bash scripts/repair-termux-dependencies.sh --upgrade-deprecated --force-audit
HELP
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 2
      ;;
  esac
done

section() {
  printf '\n\033[1m%s\033[0m\n' "$1"
  printf '%s\n' "------------------------------------------------------------"
}

run() {
  printf '\nRUN %s\n' "$*"
  "$@"
}

warn() {
  printf '\nYELLOW %s\n' "$*"
}

fail() {
  printf '\nRED %s\n' "$*" >&2
  exit 1
}

if [[ ! -f package.json ]]; then
  fail "package.json not found. Run this from the repo root: cd ~/aift-federation/Aether_Coin_biozonecurrency"
fi

section "Aether Coin Biozoecurrency dependency repair"
printf 'Mode: %s\n' "$MODE"
printf 'Upgrade deprecated direct dependencies: %s\n' "$UPGRADE_DEPRECATED"
printf 'Run TypeScript/build checks: %s\n' "$RUN_BUILD"

section "Termux and tool setup"
if command -v pkg >/dev/null 2>&1; then
  run pkg update -y
  run pkg install python make clang pkg-config nodejs-lts git -y
else
  warn "Termux pkg not detected. Skipping pkg install step."
fi

command -v node >/dev/null 2>&1 || fail "node is not installed."
command -v npm >/dev/null 2>&1 || fail "npm is not installed."
command -v git >/dev/null 2>&1 || fail "git is not installed."

PYTHON_BIN=""
if command -v python >/dev/null 2>&1; then
  PYTHON_BIN="$(command -v python)"
elif command -v python3 >/dev/null 2>&1; then
  PYTHON_BIN="$(command -v python3)"
fi

if [[ -z "$PYTHON_BIN" ]]; then
  fail "Python was not found after setup. Install python and rerun."
fi

export PYTHON="$PYTHON_BIN"
export npm_config_python="$PYTHON_BIN"
printf 'Using Python for node-gyp: %s\n' "$PYTHON"

section "Baseline git state"
run git status --short --branch || true

section "Clean dependency install without optional native packages"
rm -rf node_modules
run npm install --omit=optional

section "Dependency reports"
mkdir -p reports
npm audit --json > reports/npm-audit.json || true
npm audit > reports/npm-audit.txt || true
npm outdated > reports/npm-outdated.txt || true
npm ls --depth=0 > reports/npm-direct-deps.txt || true

section "Safe audit fix"
run npm audit fix --omit=optional || true
npm audit --json > reports/npm-audit-after-safe-fix.json || true
npm audit > reports/npm-audit-after-safe-fix.txt || true

if [[ "$UPGRADE_DEPRECATED" == "1" ]]; then
  section "Direct dependency upgrades for common deprecated packages"
  run npm install multer@latest glob@latest recharts@latest uuid@latest
  run npm install @reown/appkit@latest wagmi@latest viem@latest ethers@latest
  npm outdated > reports/npm-outdated-after-upgrades.txt || true
fi

if [[ "$MODE" == "force" ]]; then
  section "Force audit fix"
  warn "npm audit fix --force may introduce breaking changes. Review package changes carefully."
  run npm audit fix --force --omit=optional || true
  npm audit --json > reports/npm-audit-after-force-fix.json || true
  npm audit > reports/npm-audit-after-force-fix.txt || true
fi

section "Federation checks"
if [[ -f scripts/verify-federation-contracts.mjs ]]; then
  run node scripts/verify-federation-contracts.mjs
fi

if [[ -f scripts/verify-biozoecurrency-terminology.mjs ]]; then
  run node scripts/verify-biozoecurrency-terminology.mjs || warn "Terminology check still has findings. Review output and fix active files intentionally."
fi

section "Project QA"
run npm run qa:local

if [[ "$RUN_BUILD" == "1" ]]; then
  section "TypeScript and build checks"
  run npm run check
  run npm run build
else
  warn "Skipping npm run check and npm run build because --skip-build was supplied."
fi

section "Final security report"
npm audit || true

section "Changed files"
run git status --short

if [[ "$COMMIT_CHANGES" == "1" ]]; then
  section "Commit changes"
  run git add package.json package-lock.json reports scripts docs shared client server || true
  if git diff --cached --quiet; then
    warn "No staged changes to commit."
  else
    run git commit -m "chore: repair Termux dependency baseline"
  fi
fi

section "Done"
printf 'Review reports in ./reports before pushing dependency changes.\n'
printf 'Recommended next commands:\n'
printf '  git status\n'
printf '  npm audit\n'
printf '  npm run check\n'
printf '  npm run build\n'
