# nextjs-ean-plugin

WebRobot dashboard UI plugin: **EAN Image Sourcing**.

This repo serves a dual purpose:

1. **Concrete plugin** — the EAN image-sourcing UI for the WebRobot ELT
   dashboard, hot-loaded at runtime from MinIO (no rebuild of the host
   needed to update or roll out a new version).
2. **Open-source reference / boilerplate** — the structure, build
   pipeline, and hot-load contract are intentionally minimal so any
   developer can fork this repo, replace `src/*.tsx`, and ship a new
   plugin. Released under MIT.

The current `src/*.tsx` are placeholder stubs: the wiring is real, but
the views (Upload, Execute, Query, Images) need to be ported from the
legacy in-monorepo file
[`webrobot-elt-clouddashboard/frontend/plugins/ui/ean-image-sourcing/views.tsx`](https://github.com/WebRobot-Ltd/webrobot-elt-clouddashboard).
This is the next milestone; the placeholders prove the loader works
end-to-end while we extract.

---

## Architecture

```
┌──────────────────────────────────┐    ┌─────────────────────────────┐
│  This repo: nextjs-ean-plugin    │    │  WebRobot dashboard host    │
│                                  │    │                             │
│  src/Overview.tsx ─┐             │    │  /dashboard/extensions/     │
│  src/Upload.tsx    ├── vite ─┐   │    │     ean-image-sourcing-ui/  │
│  src/Execute.tsx   │   build │   │    │     <viewId>                │
│  src/Query.tsx     │         │   │    │                             │
│  src/Images.tsx    │         ▼   │    │   ┌─ renderPluginView()     │
│  src/Settings.tsx ─┘   dist/X.js │    │   │  ↓                      │
│                              │   │    │   │  usePluginComponent()   │
│  manifest.json + dist/ ──┐   │   │    │   │  ↓                      │
│                          │   │   │    │   │  fetch /api/ui-plugins/ │
│  scripts/package.mjs ────┴───┼─→ZIP   │   │     <pluginId>/file/    │
│                                  │    │   │     dist/<View>.js      │
│  ean-image-sourcing-ui.zip ──────┼──→ MinIO ──→ blob-URL import()    │
│                                  │    │   │  ↓                      │
│                                  │    │   │  <Component {...props}> │
└──────────────────────────────────┘    └─────────────────────────────┘
```

The host serves each bundle on demand through a Next.js API shim that
proxies a Jersey endpoint backed by MinIO:

```
GET /api/ui-plugins/<pluginId>/file/dist/<View>.js
  ↓
GET <jersey>/api/webrobot/api/admin/plugin-installations/<pluginId>/ui/download
  ↓
MinIO bucket sparklogs-data, object plugins/<pluginId>/<pluginId>.zip
```

The bundle is executed in the dashboard's origin via blob-URL
`import()` — full DOM access, full origin cookies. **Trust model**: only
super-admin-enabled plugins reach the loader. Sandboxing (iframe) is a
v2 enhancement.

## Build

```bash
yarn install
yarn build       # → dist/Overview.js, dist/Upload.js, ... (one bundle per view)
yarn package     # → ean-image-sourcing-ui.zip (manifest.json + dist/)
```

The build invokes Vite **once per view** so each `dist/<View>.js` is a
self-contained ESM module with React inlined. Multi-entry Vite would
split shared deps (jsx-runtime, react) into a chunk that doesn't resolve
through blob-URL `import()`, which is why we don't use it.

Bundle size, gzipped: ~20 KB per view (React inline costs ~18 KB).

## Deploy

After `yarn build && yarn package`:

1. **Upload the ZIP to MinIO** at the path declared in
   `manifest.json → ui.zipPath`:
   ```
   s3a://sparklogs-data/plugins/ean-image-sourcing-ui/ean-image-sourcing-ui.zip
   ```

   Either via the WebRobot CLI (recommended once the partner upload flow
   is GA):
   ```bash
   webrobot plugins upload \
     --file ean-image-sourcing-ui.zip \
     --plugin-id ean-image-sourcing-ui \
     --plugin-type nextjs
   ```

   Or directly with `mc` for ops:
   ```bash
   mc cp ean-image-sourcing-ui.zip \
     myminio/sparklogs-data/plugins/ean-image-sourcing-ui/ean-image-sourcing-ui.zip
   ```

2. **Register the plugin installation** so the dashboard discovers it:
   POST to the Jersey admin endpoint
   `/webrobot/api/admin/plugin-installations` with `plugin_id`,
   `plugin_type='nextjs'`, `enabled=true`, and the `ui_zip_path` from
   step 1. (The CLI does this in one shot.)

3. **Enable for the target organizations** via the dashboard
   `/dashboard/extensions/ean-image-sourcing-ui` → super-admin toggle.

The dashboard caches the ZIP in-memory for 1 hour. To force a reload
after an update, disable + re-enable the plugin (or wait).

## Plugin context (`PluginViewProps`)

Every view receives this stable contract — defined in [`src/types.ts`](src/types.ts)
and mirrored in the dashboard at
[`webrobot-elt-clouddashboard/frontend/plugins/ui/types.ts`](https://github.com/WebRobot-Ltd/webrobot-elt-clouddashboard/blob/master/frontend/plugins/ui/types.ts):

```ts
interface PluginViewProps {
  pluginId: string;       // "ean-image-sourcing-ui"
  viewId: string;         // "overview" | "upload" | "execute" | "query" | "images" | "settings"
  componentName: string;  // "dist/Overview.js" — bundle path the host requested

  installations: PluginInstallation[];

  token: string | null;   // JWT — use in Authorization headers
  user: {
    role: 'super_admin' | 'admin' | 'developer' | 'viewer' | 'authenticated' | null;
    organizationId: string | null;
    isSemiManaged: boolean;
  };
  apiBaseUrl: string;     // "" = same-origin; otherwise prefix for fetch
  buildType: string | null;
}
```

**Do** consume only `props`. **Don't** import dashboard internals
(`@/components/ui/*`, `@/lib/auth`, `@/hooks/*`) — your bundle must
work as a standalone ESM module loaded into an unknown host.

Adding a field to `PluginViewProps` on the host is non-breaking; removing
or renaming a field is breaking — bump the contract version and
coordinate with the dashboard repo.

## Use this repo as a boilerplate

For a new dashboard plugin from scratch:

1. Fork this repo, change `package.json` `name`, `manifest.json`
   `pluginId` / `displayName` / `views` / `ui.zipPath`.
2. Replace `src/*.tsx` with your views (one default-exported React
   component per view). Keep the file names matching the entries in
   `scripts/build.mjs` (`entries = [...]`).
3. `yarn build && yarn package`, deploy as above.

The contract is intentionally narrow: any framework that produces a
self-contained ESM bundle with a `default` React-component export is
supported. Vite is just the convenient default — Rollup, esbuild, or
tsup work too.

## Limits (v1)

- **React (~18 KB gz) is inlined per bundle.** v2 (import maps) will
  share React from the host. Plan for ~20 KB extra per view today.
- **No CSS bundling.** Use inline styles or styled-jsx until v2.
- **Cache invalidation is manual.** The host caches the plugin ZIP for
  1 h. To force a reload after an update, disable + re-enable the plugin.
- **No sandbox.** The bundle runs in the dashboard's origin with full
  cookie / DOM / JWT access. The host is expected to gate enable/install
  through super-admin only.

## Roadmap

- [x] v1 — ESM bundle per view, React inlined, blob-URL `import()` (today)
- [ ] **Port the real EAN views** from the in-monorepo `views.tsx` to this repo
- [ ] v2 — import maps to share React (~150 KB savings per host)
- [ ] CSS pipeline (Tailwind preset → static CSS injected at view mount)
- [ ] Hot-reload for local dev (vite dev server + dashboard `?devPlugin=` override)

## License

[MIT](LICENSE)
