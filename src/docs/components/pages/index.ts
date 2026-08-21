import type { AuthoredPage } from '@/docs/components/pages/authored-page';
import { alertPage } from '@/docs/components/pages/alert';
import { aspectRatioPage } from '@/docs/components/pages/aspect-ratio';
import { badgePage } from '@/docs/components/pages/badge';
import { breadcrumbPage } from '@/docs/components/pages/breadcrumb';
import { bubblePage } from '@/docs/components/pages/bubble';
import { buttonPage } from '@/docs/components/pages/button';
import { buttonGroupPage } from '@/docs/components/pages/button-group';
import { cardPage } from '@/docs/components/pages/card';
import { checkboxPage } from '@/docs/components/pages/checkbox';
import { collapsiblePage } from '@/docs/components/pages/collapsible';
import { directionPage } from '@/docs/components/pages/direction';
import { emptyPage } from '@/docs/components/pages/empty';
import { fieldPage } from '@/docs/components/pages/field';
import { formPage } from '@/docs/components/pages/form';
import { itemPage } from '@/docs/components/pages/item';
import { inputPage } from '@/docs/components/pages/input';
import { inputGroupPage } from '@/docs/components/pages/input-group';
import { inputOtpPage } from '@/docs/components/pages/input-otp';
import { kbdPage } from '@/docs/components/pages/kbd';
import { labelPage } from '@/docs/components/pages/label';
import { markerPage } from '@/docs/components/pages/marker';
import { messagePage } from '@/docs/components/pages/message';
import { nativeSelectPage } from '@/docs/components/pages/native-select';
import { paginationPage } from '@/docs/components/pages/pagination';
import { progressPage } from '@/docs/components/pages/progress';
import { radioGroupPage } from '@/docs/components/pages/radio-group';
import { scrollAreaPage } from '@/docs/components/pages/scroll-area';
import { separatorPage } from '@/docs/components/pages/separator';
import { skeletonPage } from '@/docs/components/pages/skeleton';
import { spinnerPage } from '@/docs/components/pages/spinner';
import { switchPage } from '@/docs/components/pages/switch';
import { tablePage } from '@/docs/components/pages/table';
import { textareaPage } from '@/docs/components/pages/textarea';
import { togglePage } from '@/docs/components/pages/toggle';
import { toggleGroupPage } from '@/docs/components/pages/toggle-group';
import { typographyPage } from '@/docs/components/pages/typography';

export const authoredPages: Readonly<Record<string, AuthoredPage>> = {
  ...Object.fromEntries(
    [
      alertPage,
      aspectRatioPage,
      badgePage,
      breadcrumbPage,
      bubblePage,
      buttonPage,
      buttonGroupPage,
      cardPage,
      checkboxPage,
      collapsiblePage,
      directionPage,
      emptyPage,
      fieldPage,
      formPage,
      itemPage,
      inputPage,
      inputGroupPage,
      inputOtpPage,
      kbdPage,
      labelPage,
      markerPage,
      messagePage,
      nativeSelectPage,
      paginationPage,
      progressPage,
      radioGroupPage,
      scrollAreaPage,
      separatorPage,
      skeletonPage,
      spinnerPage,
      switchPage,
      tablePage,
      textareaPage,
      togglePage,
      toggleGroupPage,
      typographyPage,
    ].map((page) => [page.slug, page]),
  ),
};
