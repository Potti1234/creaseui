import type { AuthoredPage } from '@/docs/components/pages/authored-page';
import { alertPage } from '@/docs/components/pages/alert';
import { aspectRatioPage } from '@/docs/components/pages/aspect-ratio';
import { badgePage } from '@/docs/components/pages/badge';
import { buttonPage } from '@/docs/components/pages/button';
import { cardPage } from '@/docs/components/pages/card';
import { emptyPage } from '@/docs/components/pages/empty';
import { kbdPage } from '@/docs/components/pages/kbd';
import { progressPage } from '@/docs/components/pages/progress';
import { separatorPage } from '@/docs/components/pages/separator';
import { skeletonPage } from '@/docs/components/pages/skeleton';
import { spinnerPage } from '@/docs/components/pages/spinner';

export const authoredPages: Readonly<Record<string, AuthoredPage>> = {
  ...Object.fromEntries(
    [
      alertPage,
      aspectRatioPage,
      badgePage,
      buttonPage,
      cardPage,
      emptyPage,
      kbdPage,
      progressPage,
      separatorPage,
      skeletonPage,
      spinnerPage,
    ].map((page) => [page.slug, page]),
  ),
};
