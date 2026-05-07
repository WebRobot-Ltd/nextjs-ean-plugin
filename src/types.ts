// PluginViewProps — copy of the host contract from
// webrobot-elt-clouddashboard/frontend/plugins/ui/types.ts.
// Plugins should NOT import from the host directly; they pin a copy here so
// the bundle is self-contained. Adding fields to the host is non-breaking;
// removing/renaming is breaking.
export type AppRole =
  | 'super_admin'
  | 'admin'
  | 'developer'
  | 'viewer'
  | 'authenticated';

export interface PluginInstallation {
  id: number;
  plugin_id: string;
  plugin_name?: string;
  plugin_type?: string;
  version?: string;
  build_type?: string;
  build_number?: number;
  organization_id?: string;
  enabled?: boolean;
  installed_at?: string;
  description?: string;
}

export interface PluginViewProps {
  pluginId: string;
  viewId: string;
  componentName: string;
  installations: PluginInstallation[];
  token: string | null;
  user: {
    role: AppRole | null;
    organizationId: string | null;
    isSemiManaged: boolean;
  };
  apiBaseUrl: string;
  buildType: string | null;
}
