import type { PluginViewProps } from './types';
import { ViewStub } from './lib/ViewStub';

// TODO: port the run-pipeline trigger from
// webrobot-elt-clouddashboard/frontend/plugins/ui/ean-image-sourcing/views.tsx
// (EanImageSourcingExecute). Calls the `[country]/execute` Next.js API route.
export default function Execute(props: PluginViewProps) {
  return <ViewStub viewLabel="Execute" {...props} />;
}
