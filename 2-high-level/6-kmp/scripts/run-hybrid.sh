#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO="$(cd "$ROOT/../.." && pwd)"
MFE="$REPO/2-high-level/5-mfe-partial"
export JAVA_HOME="${JAVA_HOME:-/Library/Java/JavaVirtualMachines/zulu-21.jdk/Contents/Home}"
export PATH="${HOME}/.local/bin:/usr/local/bin:/opt/homebrew/bin:$PATH"

port_busy() {
  lsof -nP -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1
}

if [[ ! -d "$MFE/mfe-shell/node_modules" || ! -d "$MFE/mfe-vue/node_modules" ]]; then
  echo "npm install:all no 5-mfe-partial…"
  (cd "$MFE" && npm install && npm run install:all)
fi

if ! port_busy 5001 || ! port_busy 5002 || ! port_busy 5003; then
  echo "Subindo remotes Vue/React/Angular…"
  (cd "$MFE" && npm run build:remotes)
  (cd "$MFE" && nohup npm run dev:vue >/tmp/elevate-mfe-vue.log 2>&1 &)
  (cd "$MFE" && nohup npm run dev:react >/tmp/elevate-mfe-react.log 2>&1 &)
  (cd "$MFE" && nohup npm run dev:angular >/tmp/elevate-mfe-angular.log 2>&1 &)
  (cd "$MFE" && npm run wait-for-remotes)
else
  echo "Remotes já nas portas 5001–5003"
fi

SHELL_PORT=5000
if port_busy 5000; then
  owner="$(lsof -nP -iTCP:5000 -sTCP:LISTEN | awk 'NR==2{print $1}')"
  if [[ "$owner" == "node" || "$owner" == "vite" ]]; then
    echo "Shell já em :5000 ($owner)"
  else
    SHELL_PORT=5100
    echo "Porta 5000 ocupada por $owner (AirPlay) — shell em :5100"
  fi
fi

if ! port_busy "$SHELL_PORT"; then
  echo "Subindo mfe-shell em :${SHELL_PORT}…"
  (cd "$MFE/mfe-shell" && nohup npx vite --host 127.0.0.1 --port "$SHELL_PORT" --strictPort >/tmp/elevate-mfe-shell.log 2>&1 &)
fi

echo "Aguardando http://127.0.0.1:${SHELL_PORT}/ …"
for _ in $(seq 1 90); do
  if curl -sf -o /dev/null "http://127.0.0.1:${SHELL_PORT}/"; then
    echo "Shell pronto"
    exec "$ROOT/scripts/run-ios.sh"
  fi
  sleep 2
done

echo "Timeout esperando o shell em :${SHELL_PORT}" >&2
exit 1
