import { useEffect, useState } from 'react';
import type { PluginViewProps } from './types';

// Default export — the host loader resolves `default` first.
export default function Overview(props: PluginViewProps) {
  const { pluginId, viewId, user, token, apiBaseUrl, installations, buildType } = props;
  const [now, setNow] = useState<string>(() => new Date().toISOString());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date().toISOString()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>EAN Image Sourcing — Overview</h2>
      <p style={{ color: '#444' }}>
        Hot-load smoke test. If you can read this, the dashboard fetched
        the bundle from MinIO, executed it via blob-URL <code>import()</code>,
        and rendered the resolved <code>default</code> export with the host
        context. Replace this body with the real EAN overview.
      </p>

      <table style={{ borderCollapse: 'collapse', marginTop: 8 }}>
        <tbody>
          <Row k="pluginId" v={pluginId} />
          <Row k="viewId" v={viewId} />
          <Row k="user.role" v={String(user.role)} />
          <Row k="user.organizationId" v={String(user.organizationId)} />
          <Row k="user.isSemiManaged" v={String(user.isSemiManaged)} />
          <Row k="token (truncated)" v={token ? token.slice(0, 12) + '…' : 'null'} />
          <Row k="apiBaseUrl" v={apiBaseUrl || '(same-origin)'} />
          <Row k="buildType" v={String(buildType)} />
          <Row k="installations.length" v={String(installations.length)} />
          <Row k="bundle ticked at" v={now} />
        </tbody>
      </table>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <tr>
      <td style={{ padding: '4px 12px 4px 0', color: '#666', fontFamily: 'monospace' }}>{k}</td>
      <td style={{ padding: '4px 0', fontFamily: 'monospace' }}>{v}</td>
    </tr>
  );
}
