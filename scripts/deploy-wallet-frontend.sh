#!/usr/bin/env bash
set -Eeuo pipefail
: "${DEPLOY_HOST:?}" "${DEPLOY_USER:?}" "${DEPLOY_KNOWN_HOSTS:?}" "${DEPLOY_HTTPS_ORIGIN:?}"
DEPLOY_PORT=${DEPLOY_PORT:-22}
[[ "$DEPLOY_HOST" =~ ^[a-zA-Z0-9][a-zA-Z0-9.-]*$ ]] || exit 1
[[ "$DEPLOY_USER" =~ ^[a-z_][a-z0-9_-]*$ ]] || exit 1
[[ "$DEPLOY_PORT" =~ ^[0-9]+$ ]] && (( DEPLOY_PORT > 0 && DEPLOY_PORT < 65536 )) || exit 1
[[ "$DEPLOY_HTTPS_ORIGIN" =~ ^https://[a-zA-Z0-9][a-zA-Z0-9.-]*(:[0-9]+)?/?$ ]] || exit 1
[[ -f aetherion-deploy.tar.gz ]] || exit 1
# The supplied known_hosts entry must be verified independently by the operator.
# Never derive trust from ssh-keyscan during deployment.
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
printf '%s\n' "$DEPLOY_KNOWN_HOSTS" > "$work/known_hosts"
chmod 600 "$work/known_hosts"
lookup=$DEPLOY_HOST
[[ "$DEPLOY_PORT" == 22 ]] || lookup="[$DEPLOY_HOST]:$DEPLOY_PORT"
ssh-keygen -F "$lookup" -f "$work/known_hosts" >/dev/null
opts=(-o StrictHostKeyChecking=yes -o "UserKnownHostsFile=$work/known_hosts" -o BatchMode=yes -o ConnectTimeout=15)
target="$DEPLOY_USER@$DEPLOY_HOST"
release="$(date -u +%Y%m%dT%H%M%SZ)-${GITHUB_SHA:-manual}-${GITHUB_RUN_ID:-0}"
[[ "$release" =~ ^[A-Za-z0-9-]+$ ]] || exit 1
ssh "${opts[@]}" -p "$DEPLOY_PORT" "$target" 'mkdir -p "$HOME/aetherion_uploads"'
scp "${opts[@]}" -P "$DEPLOY_PORT" aetherion-deploy.tar.gz "$target:aetherion_uploads/$release.tar.gz"
# A pre-provisioned service must point to ~/aetherion_current/server-redirect.js.
ssh "${opts[@]}" -p "$DEPLOY_PORT" "$target" bash -s -- "$release" <<'REMOTE'
set -Eeuo pipefail
release=$1
node -e 'if(process.versions.node.split(".")[0] !== "22") process.exit(1)'
mkdir -p "$HOME/aetherion_releases"
test ! -e "$HOME/aetherion_current" || test -L "$HOME/aetherion_current"
unit=$(systemctl show --property=ExecStart --value aetherion)
[[ "$unit" == *"$HOME/aetherion_current/server-redirect.js"* ]]
[[ "$(systemctl show --property=User --value aetherion)" == "$(id -un)" ]]
previous=$(readlink "$HOME/aetherion_current" || true)
switched=false
# Failed releases must restore the prior link; never recursively delete a release.
rollback() {
  [[ "$switched" == true ]] || return 0
  if [[ -n "$previous" ]]; then
    ln -sfn "$previous" "$HOME/aetherion_current.next"
    mv -Tf "$HOME/aetherion_current.next" "$HOME/aetherion_current"
    sudo -n systemctl restart aetherion
  else
    rm -f "$HOME/aetherion_current"
    sudo -n systemctl stop aetherion
  fi
}
trap rollback ERR
mkdir "$HOME/aetherion_releases/$release"
tar -xzf "$HOME/aetherion_uploads/$release.tar.gz" -C "$HOME/aetherion_releases/$release"
cd "$HOME/aetherion_releases/$release"
npm ci --omit=dev --ignore-scripts
printf '%s' "$previous" > .previous-release
ln -sfn "$PWD" "$HOME/aetherion_current.next"
mv -Tf "$HOME/aetherion_current.next" "$HOME/aetherion_current"
switched=true
sudo -n systemctl restart aetherion
sudo -n systemctl is-active --quiet aetherion
REMOTE
# A process status or root redirect is not release verification.
if ! node scripts/verify-wallet-http.mjs "$DEPLOY_HTTPS_ORIGIN"; then
  ssh "${opts[@]}" -p "$DEPLOY_PORT" "$target" bash -s -- "$release" <<'ROLLBACK'
set -Eeuo pipefail
[[ "$(readlink "$HOME/aetherion_current")" == "$HOME/aetherion_releases/$1" ]]
previous=$(cat "$HOME/aetherion_releases/$1/.previous-release")
if [[ -n "$previous" ]]; then
  ln -sfn "$previous" "$HOME/aetherion_current.next"
  mv -Tf "$HOME/aetherion_current.next" "$HOME/aetherion_current"
  sudo -n systemctl restart aetherion
else
  rm -f "$HOME/aetherion_current"
  sudo -n systemctl stop aetherion
fi
ROLLBACK
  exit 1
fi
