import type { AuthoredPage } from '@/docs/components/pages/authored-page';
import { alertPage } from '@/docs/components/pages/alert';
import { aspectRatioPage } from '@/docs/components/pages/aspect-ratio';
import { badgePage } from '@/docs/components/pages/badge';
import { bubblePage } from '@/docs/components/pages/bubble';
import { buttonPage } from '@/docs/components/pages/button';
import { cardPage } from '@/docs/components/pages/card';
import { emptyPage } from '@/docs/components/pages/empty';
import { kbdPage } from '@/docs/components/pages/kbd';
import { markerPage } from '@/docs/components/pages/marker';
import { progressPage } from '@/docs/components/pages/progress';
import { separatorPage } from '@/docs/components/pages/separator';
import { skeletonPage } from '@/docs/components/pages/skeleton';
import { spinnerPage } from '@/docs/components/pages/spinner';
import { typographyPage } from '@/docs/components/pages/typography';

export const authoredPages: Readonly<Record<string, AuthoredPage>> = {
  ...Object.fromEntries(
    [
      alertPage,
      aspectRatioPage,
      badgePage,
      bubblePage,
      buttonPage,
      cardPage,
      emptyPage,
      kbdPage,
      markerPage,
      progressPage,
      separatorPage,
      skeletonPage,
      spinnerPage,
      typographyPage,
    ].map((page) => [page.slug, page]),
  ),
};
