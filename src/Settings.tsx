import type { PluginViewProps } from './types';

export default function Settings(props: PluginViewProps) {
  const { user } = props;
  if (user.role !== 'super_admin' && user.role !== 'admin') {
    return (
      <div style={{ padding: 16, fontFamily: 'system-ui, sans-serif' }}>
        <h2>Settings</h2>
        <p style={{ color: '#a00' }}>
          Forbidden — only admin / super_admin can see this view. Current role:{' '}
          <code>{String(user.role)}</code>.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ marginTop: 0 }}>EAN Image Sourcing — Settings</h2>
      <p style={{ color: '#444' }}>
        This view validates the role gate at the plugin level. Bundle is
        loaded only when <code>viewId === 'settings'</code> is requested,
        because the host fetches one bundle per view (manifest entry
        <code>views[i].component = "dist/Settings.js"</code>).
      </p>
      <p>
        Logged in as <strong>{user.role}</strong> in org{' '}
        <strong>{user.organizationId ?? '(global)'}</strong>.
      </p>
    </div>
  );
}
