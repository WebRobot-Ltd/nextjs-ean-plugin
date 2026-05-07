import type { PluginViewProps } from './types';
import { ViewStub } from './lib/ViewStub';

// TODO: port the Trino/Presto query view from
// webrobot-elt-clouddashboard/frontend/plugins/ui/ean-image-sourcing/views.tsx
// (EanImageSourcingQuery). Calls the `[country]/query` Next.js API route.
export default function Query(props: PluginViewProps) {
  return <ViewStub viewLabel="Query" {...props} />;
}
