import type { AuthoredPage } from '@/docs/components/pages/authored-page';
import { buttonPage } from '@/docs/components/pages/button';

export const authoredPages: Readonly<Record<string, AuthoredPage>> = {
  [buttonPage.slug]: buttonPage,
};
