import type { PluginViewProps } from './types';
import { ViewStub } from './lib/ViewStub';

// TODO: port the upload form + EAN CSV ingestion logic from
// webrobot-elt-clouddashboard/frontend/plugins/ui/ean-image-sourcing/views.tsx
// (EanImageSourcingUpload). Drop the legacy `@/components/ui/*` imports;
// inline minimal markup or use a small design-system peer dep.
export default function Upload(props: PluginViewProps) {
  return <ViewStub viewLabel="Upload" {...props} />;
}
