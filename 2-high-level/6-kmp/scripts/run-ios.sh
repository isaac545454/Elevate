#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export JAVA_HOME="${JAVA_HOME:-/Library/Java/JavaVirtualMachines/zulu-21.jdk/Contents/Home}"

DESTINATION="${1:-}"
if [[ -z "$DESTINATION" ]]; then
  DESTINATION="$(
    python3 - <<'PY'
import subprocess, json
raw = subprocess.check_output(
    ["xcrun", "simctl", "list", "devices", "available", "-j"],
    text=True,
)
data = json.loads(raw)
preferred = []
fallback = []
for runtime, devices in data.get("devices", {}).items():
    if "iOS" not in runtime and "iphoneos" not in runtime.lower():
        continue
    for d in devices:
        if not d.get("isAvailable"):
            continue
        name = d.get("name", "")
        udid = d.get("udid")
        if not udid:
            continue
        row = (name, udid)
        if "iPhone" in name:
            preferred.append(row)
        else:
            fallback.append(row)
pick = (preferred or fallback)
if not pick:
    raise SystemExit("nenhum iOS Simulator disponível")
print(pick[0][1])
PY
  )"
fi

echo "Simulator: $DESTINATION"
xcrun simctl boot "$DESTINATION" 2>/dev/null || true
open -a Simulator

xcodebuild \
  -project "$ROOT/iosApp/iosApp.xcodeproj" \
  -scheme iosApp \
  -configuration Debug \
  -destination "id=$DESTINATION" \
  -derivedDataPath "$ROOT/iosApp/build" \
  CODE_SIGNING_ALLOWED=NO \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGN_IDENTITY=- \
  build

APP="$(find "$ROOT/iosApp/build" -name 'ElevateKmp.app' -path '*Debug-iphonesimulator*' | head -1)"
if [[ -z "$APP" ]]; then
  echo "ElevateKmp.app não encontrado após o build" >&2
  exit 1
fi

xcrun simctl install "$DESTINATION" "$APP"
xcrun simctl launch "$DESTINATION" com.elevate.kmp.iosApp
echo "App no Simulator: com.elevate.kmp.iosApp"
