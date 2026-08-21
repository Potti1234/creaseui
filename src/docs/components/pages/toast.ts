import { authoredPage } from '@/docs/components/pages/authored-page';
import { notificationDefinition } from '@/docs/components/pages/notification-page';

export const toastPage = authoredPage({
  slug: 'toast', title: 'Toast', kind: 'recipe',
  definition: notificationDefinition({ slug: 'toast', title: 'Toast', namespace: 'Toast', kind: 'recipe', description: 'Provides the shadcn Toast naming surface as a source-compatible recipe alias over Crease UI’s Sonner notification state engine.' }),
});
