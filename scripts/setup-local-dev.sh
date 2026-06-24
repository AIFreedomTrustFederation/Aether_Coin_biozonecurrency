#!/usr/bin/env bash
set -euo pipefail

printf '\nAether Coin Biozoecurrency local development setup\n'
printf '=================================================\n\n'

need_command() {
  local name="$1"
  if command -v "$name" >/dev/null 2>&1; then
    printf 'GREEN %s found: %s\n' "$name" "$(command -v "$name")"
    return 0
  fi

  printf 'RED %s is missing\n' "$name"
  return 1
}

install_with_apt() {
  if ! command -v apt-get >/dev/null 2>&1; then
    return 1
  fi

  printf '\nAPT detected. Installing baseline tools.\n'
  sudo apt-get update
  sudo apt-get install -y git nodejs npm python3 python3-venv curl ca-certificates

  if ! command -v gh >/dev/null 2>&1; then
    printf '\nGitHub CLI is not available from the current PATH.\n'
    printf 'Install gh from your distro package manager or GitHub CLI docs, then run this script again.\n'
  fi
}

install_with_brew() {
  if ! command -v brew >/dev/null 2>&1; then
    return 1
  fi

  printf '\nHomebrew detected. Installing baseline tools.\n'
  brew install git node python gh
}

if ! need_command git || ! need_command node || ! need_command npm || ! need_command python3; then
  install_with_brew || install_with_apt || true
fi

printf '\nFinal tool check\n'
printf '----------------\n'
need_command git || true
need_command node || true
need_command npm || true
need_command python3 || true
need_command gh || true

echo
printf 'Recommended local checks after setup:\n'
printf '  node scripts/run-local-federation-checks.mjs\n'
printf '  npm install\n'
printf '  npm run qa:local\n'
printf '  npm run check\n'
printf '  npm run build\n'
