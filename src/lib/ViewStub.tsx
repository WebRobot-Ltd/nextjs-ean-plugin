import type { PluginViewProps } from '../types';

// Placeholder rendered by views that haven't been ported yet from the
// in-monorepo views.tsx. Lives in src/lib/ so it gets inlined into each
// view bundle (the build invokes Vite once per view → no shared chunks).
// Each stub is replaced by a real implementation as we extract from
// webrobot-elt-clouddashboard/frontend/plugins/ui/ean-image-sourcing/views.tsx.
export function ViewStub({
  viewLabel,
  pluginId,
  viewId,
  user,
  apiBaseUrl,
}: PluginViewProps & { viewLabel: string }) {
  return (
    <div style={{ padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ marginTop: 0 }}>EAN Image Sourcing — {viewLabel}</h2>
      <p style={{ color: '#a60' }}>
        Placeholder. This view has not been ported yet from the legacy
        in-repo bundle. The dashboard correctly resolved
        <code> {pluginId}/{viewId} </code> via the hot-load loader, so the
        wiring works — only the contents are missing.
      </p>
      <p style={{ color: '#444' }}>
        When porting from <code>views.tsx</code>:
      </p>
      <ul style={{ color: '#444' }}>
        <li>Use <code>props.token</code> in <code>Authorization: Bearer …</code> headers — do NOT import <code>@/lib/auth</code></li>
        <li>Call backend at <code>{`${apiBaseUrl || ''}/api/ean-image-sourcing/<route>`}</code></li>
        <li>Read user role from <code>props.user.role</code> — do NOT call <code>getCurrentUserRole()</code></li>
        <li>Drop <code>@/components/ui/*</code> imports; inline minimal HTML/CSS or use a peer-dep design system</li>
      </ul>
      <p style={{ color: '#888', fontSize: 12 }}>
        Logged in as <code>{String(user.role)}</code> in org{' '}
        <code>{user.organizationId ?? '(global)'}</code>.
      </p>
    </div>
  );
}
