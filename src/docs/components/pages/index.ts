import type { AuthoredPage } from '@/docs/components/pages/authored-page';
import { alertPage } from '@/docs/components/pages/alert';
import { aspectRatioPage } from '@/docs/components/pages/aspect-ratio';
import { badgePage } from '@/docs/components/pages/badge';
import { bubblePage } from '@/docs/components/pages/bubble';
import { buttonPage } from '@/docs/components/pages/button';
import { cardPage } from '@/docs/components/pages/card';
import { directionPage } from '@/docs/components/pages/direction';
import { emptyPage } from '@/docs/components/pages/empty';
import { itemPage } from '@/docs/components/pages/item';
import { kbdPage } from '@/docs/components/pages/kbd';
import { labelPage } from '@/docs/components/pages/label';
import { markerPage } from '@/docs/components/pages/marker';
import { messagePage } from '@/docs/components/pages/message';
import { progressPage } from '@/docs/components/pages/progress';
import { scrollAreaPage } from '@/docs/components/pages/scroll-area';
import { separatorPage } from '@/docs/components/pages/separator';
import { skeletonPage } from '@/docs/components/pages/skeleton';
import { spinnerPage } from '@/docs/components/pages/spinner';
import { tablePage } from '@/docs/components/pages/table';
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
      directionPage,
      emptyPage,
      itemPage,
      kbdPage,
      labelPage,
      markerPage,
      messagePage,
      progressPage,
      scrollAreaPage,
      separatorPage,
      skeletonPage,
      spinnerPage,
      tablePage,
      typographyPage,
    ].map((page) => [page.slug, page]),
  ),
};
