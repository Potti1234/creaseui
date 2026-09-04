import type { DocsExample } from '@/docs/components/page-definition'; import { notificationExamples, type NotificationConfig } from '@/docs/components/pages/notification-page';
export const toastConfig: NotificationConfig = { slug: 'toast', title: 'Toast', namespace: 'Toast', kind: 'recipe', description: 'Provides the shadcn Toast naming surface as a source-compatible recipe alias over Crease UI’s Sonner notification state engine.' };
export const toastExamples = (renderer: 'tailwind' | 'stylex'): ReadonlyArray<DocsExample> => notificationExamples(toastConfig, renderer);
