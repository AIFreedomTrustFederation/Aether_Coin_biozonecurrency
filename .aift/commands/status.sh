#!/usr/bin/env sh
set -eu
echo "AIFT repo: ${AIFT_REPO_NAME:-unknown}"
git status --short
