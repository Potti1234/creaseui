import type { AuthoredPage } from '@/docs/components/pages/authored-page';
import { alertPage } from '@/docs/components/pages/alert';
import { alertDialogPage } from '@/docs/components/pages/alert-dialog';
import { aspectRatioPage } from '@/docs/components/pages/aspect-ratio';
import { avatarPage } from '@/docs/components/pages/avatar';
import { badgePage } from '@/docs/components/pages/badge';
import { breadcrumbPage } from '@/docs/components/pages/breadcrumb';
import { bubblePage } from '@/docs/components/pages/bubble';
import { buttonPage } from '@/docs/components/pages/button';
import { buttonGroupPage } from '@/docs/components/pages/button-group';
import { cardPage } from '@/docs/components/pages/card';
import { carouselPage } from '@/docs/components/pages/carousel';
import { checkboxPage } from '@/docs/components/pages/checkbox';
import { collapsiblePage } from '@/docs/components/pages/collapsible';
import { directionPage } from '@/docs/components/pages/direction';
import { dialogPage } from '@/docs/components/pages/dialog';
import { drawerPage } from '@/docs/components/pages/drawer';
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
import { resizablePage } from '@/docs/components/pages/resizable';
import { scrollAreaPage } from '@/docs/components/pages/scroll-area';
import { separatorPage } from '@/docs/components/pages/separator';
import { sheetPage } from '@/docs/components/pages/sheet';
import { skeletonPage } from '@/docs/components/pages/skeleton';
import { sliderPage } from '@/docs/components/pages/slider';
import { spinnerPage } from '@/docs/components/pages/spinner';
import { switchPage } from '@/docs/components/pages/switch';
import { tabsPage } from '@/docs/components/pages/tabs';
import { tablePage } from '@/docs/components/pages/table';
import { textareaPage } from '@/docs/components/pages/textarea';
import { togglePage } from '@/docs/components/pages/toggle';
import { toggleGroupPage } from '@/docs/components/pages/toggle-group';
import { typographyPage } from '@/docs/components/pages/typography';

export const authoredPages: Readonly<Record<string, AuthoredPage>> = {
  ...Object.fromEntries(
    [
      alertPage,
      alertDialogPage,
      aspectRatioPage,
      avatarPage,
      badgePage,
      breadcrumbPage,
      bubblePage,
      buttonPage,
      buttonGroupPage,
      cardPage,
      carouselPage,
      checkboxPage,
      collapsiblePage,
      directionPage,
      dialogPage,
      drawerPage,
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
      resizablePage,
      scrollAreaPage,
      separatorPage,
      sheetPage,
      skeletonPage,
      sliderPage,
      spinnerPage,
      switchPage,
      tabsPage,
      tablePage,
      textareaPage,
      togglePage,
      toggleGroupPage,
      typographyPage,
    ].map((page) => [page.slug, page]),
  ),
};
