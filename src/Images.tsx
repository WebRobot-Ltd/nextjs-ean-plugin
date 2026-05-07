import type { PluginViewProps } from './types';
import { ViewStub } from './lib/ViewStub';

// TODO: port the image grid + scrollable preview from
// webrobot-elt-clouddashboard/frontend/plugins/ui/ean-image-sourcing/views.tsx
// (EanImageSourcingImages). Calls the `[country]/images` Next.js API route.
export default function Images(props: PluginViewProps) {
  return <ViewStub viewLabel="Images" {...props} />;
}
