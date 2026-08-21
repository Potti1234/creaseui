import { authoredPage } from '@/docs/components/pages/authored-page';
import { notificationDefinition } from '@/docs/components/pages/notification-page';

export const sonnerPage = authoredPage({
  slug: 'sonner', title: 'Sonner', kind: 'submodel',
  definition: notificationDefinition({ slug: 'sonner', title: 'Sonner', namespace: 'Sonner', kind: 'submodel', description: 'Queues transient or sticky application notifications with variants, actions, and deterministic dismissal effects.' }),
});
