#!/usr/bin/env bash
# package-bundle.sh — assemble the unified plugin bundle ZIP for a UI-only
# plugin. Output layout follows the v1 spec:
#
#   ean-image-sourcing-ui-<version>.zip
#   ├── manifest.json      ← root bundle manifest with components[]
#   └── ui/
#       ├── manifest.json  ← UI sub-manifest (the existing repo manifest.json)
#       └── dist/          ← per-view ESM bundles (output of vite library build)
#
# Spec: webrobot-elt-clouddashboard/docs/BUNDLE_DISTRIBUTION_FORMAT.md
# Reference for multi-component plugins: webrobot-sentimental-plugin
#
# Usage:
#   scripts/package-bundle.sh                # build + package
#   scripts/package-bundle.sh --skip-build   # reuse existing dist/

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

SKIP_BUILD=false
for arg in "$@"; do
  case "$arg" in
    --skip-build) SKIP_BUILD=true ;;
    *) echo "unknown arg: $arg" >&2; exit 2 ;;
  esac
done

PLUGIN_ID=$(node -p "require('$ROOT_DIR/manifest.json').pluginId")
VERSION=$(node -p   "require('$ROOT_DIR/package.json').version")
DISPLAY_NAME=$(node -p "require('$ROOT_DIR/manifest.json').displayName")

BUNDLE_NAME="${PLUGIN_ID}-${VERSION}.zip"
STAGE_DIR="$ROOT_DIR/build/bundle-stage"
OUT_DIR="$ROOT_DIR/build"
OUT="$OUT_DIR/$BUNDLE_NAME"

echo "→ Packaging $PLUGIN_ID v$VERSION  (out: $OUT)"

rm -rf "$STAGE_DIR" "$OUT"
mkdir -p "$STAGE_DIR/ui" "$OUT_DIR"

# ── Build UI ──────────────────────────────────────────────────────────────────
if ! $SKIP_BUILD; then
  echo "→ Building ui/  (Vite)"
  [ -d "$ROOT_DIR/node_modules" ] || npm install --silent
  node "$ROOT_DIR/scripts/build.mjs" >/dev/null
fi

if [ ! -d "$ROOT_DIR/dist" ]; then
  echo "✗ dist/ not found — run with build first" >&2
  exit 1
fi

# ── Stage ui/manifest.json + ui/dist/ ─────────────────────────────────────────
cp "$ROOT_DIR/manifest.json" "$STAGE_DIR/ui/manifest.json"
cp -r "$ROOT_DIR/dist" "$STAGE_DIR/ui/dist"
echo "  + ui/manifest.json + ui/dist/$(ls "$ROOT_DIR/dist" | wc -l) files"

# ── Generate root bundle manifest ─────────────────────────────────────────────
ROOT_MANIFEST="$STAGE_DIR/manifest.json"
node -e "
const fs = require('fs');
const root = {
  pluginId:    $(node -e "console.log(JSON.stringify('${PLUGIN_ID}'))"),
  version:     $(node -e "console.log(JSON.stringify('${VERSION}'))"),
  displayName: $(node -e "console.log(JSON.stringify('${DISPLAY_NAME}'))"),
  description: 'EAN Image Sourcing — dashboard UI plugin (hot-loaded via blob-URL import()).',
  license:     'MIT',
  homepage:    'https://github.com/WebRobot-Ltd/nextjs-ean-plugin',
  requires: {
    platformVersion: '>=0.5.0',
    kernelVersion:   '>=0.5-261'
  },
  components: [
    {
      type:     'ui',
      subId:    $(node -e "console.log(JSON.stringify('${PLUGIN_ID}'))"),
      manifest: 'ui/manifest.json',
      distDir:  'ui/dist'
    }
  ]
};
fs.writeFileSync('$ROOT_MANIFEST', JSON.stringify(root, null, 2) + '\n');
console.log('  + manifest.json (root bundle manifest)');
"

# ── ZIP it up ─────────────────────────────────────────────────────────────────
echo "→ Packing $OUT"
(cd "$STAGE_DIR" && zip -qr "$OUT" . )
SIZE=$(stat -c %s "$OUT")
echo "✅ $OUT  ($SIZE bytes)"

echo
echo "Bundle contents:"
unzip -l "$OUT" | tail -n +4 | head -n -2
