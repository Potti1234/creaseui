import type { AuthoredPage } from '@/docs/components/pages/authored-page';
import { accordionPage } from '@/docs/components/pages/accordion';
import { alertPage } from '@/docs/components/pages/alert';
import { alertDialogPage } from '@/docs/components/pages/alert-dialog';
import { aspectRatioPage } from '@/docs/components/pages/aspect-ratio';
import { attachmentPage } from '@/docs/components/pages/attachment';
import { avatarPage } from '@/docs/components/pages/avatar';
import { badgePage } from '@/docs/components/pages/badge';
import { breadcrumbPage } from '@/docs/components/pages/breadcrumb';
import { bubblePage } from '@/docs/components/pages/bubble';
import { buttonPage } from '@/docs/components/pages/button';
import { buttonGroupPage } from '@/docs/components/pages/button-group';
import { calendarPage } from '@/docs/components/pages/calendar';
import { cardPage } from '@/docs/components/pages/card';
import { carouselPage } from '@/docs/components/pages/carousel';
import { checkboxPage } from '@/docs/components/pages/checkbox';
import { collapsiblePage } from '@/docs/components/pages/collapsible';
import { comboboxPage } from '@/docs/components/pages/combobox';
import { commandPage } from '@/docs/components/pages/command';
import { contextMenuPage } from '@/docs/components/pages/context-menu';
import { datePickerPage } from '@/docs/components/pages/date-picker';
import { directionPage } from '@/docs/components/pages/direction';
import { dialogPage } from '@/docs/components/pages/dialog';
import { drawerPage } from '@/docs/components/pages/drawer';
import { dropdownMenuPage } from '@/docs/components/pages/dropdown-menu';
import { emptyPage } from '@/docs/components/pages/empty';
import { fieldPage } from '@/docs/components/pages/field';
import { formPage } from '@/docs/components/pages/form';
import { hoverCardPage } from '@/docs/components/pages/hover-card';
import { itemPage } from '@/docs/components/pages/item';
import { inputPage } from '@/docs/components/pages/input';
import { inputGroupPage } from '@/docs/components/pages/input-group';
import { inputOtpPage } from '@/docs/components/pages/input-otp';
import { kbdPage } from '@/docs/components/pages/kbd';
import { labelPage } from '@/docs/components/pages/label';
import { markerPage } from '@/docs/components/pages/marker';
import { messagePage } from '@/docs/components/pages/message';
import { messageScrollerPage } from '@/docs/components/pages/message-scroller';
import { menubarPage } from '@/docs/components/pages/menubar';
import { nativeSelectPage } from '@/docs/components/pages/native-select';
import { navigationMenuPage } from '@/docs/components/pages/navigation-menu';
import { paginationPage } from '@/docs/components/pages/pagination';
import { popoverPage } from '@/docs/components/pages/popover';
import { progressPage } from '@/docs/components/pages/progress';
import { radioGroupPage } from '@/docs/components/pages/radio-group';
import { resizablePage } from '@/docs/components/pages/resizable';
import { scrollAreaPage } from '@/docs/components/pages/scroll-area';
import { separatorPage } from '@/docs/components/pages/separator';
import { selectPage } from '@/docs/components/pages/select';
import { sheetPage } from '@/docs/components/pages/sheet';
import { sidebarPage } from '@/docs/components/pages/sidebar';
import { skeletonPage } from '@/docs/components/pages/skeleton';
import { sliderPage } from '@/docs/components/pages/slider';
import { spinnerPage } from '@/docs/components/pages/spinner';
import { sonnerPage } from '@/docs/components/pages/sonner';
import { switchPage } from '@/docs/components/pages/switch';
import { tabsPage } from '@/docs/components/pages/tabs';
import { tablePage } from '@/docs/components/pages/table';
import { textareaPage } from '@/docs/components/pages/textarea';
import { togglePage } from '@/docs/components/pages/toggle';
import { toastPage } from '@/docs/components/pages/toast';
import { toggleGroupPage } from '@/docs/components/pages/toggle-group';
import { tooltipPage } from '@/docs/components/pages/tooltip';
import { typographyPage } from '@/docs/components/pages/typography';

export const authoredPages: Readonly<Record<string, AuthoredPage>> = {
  ...Object.fromEntries(
    [
      accordionPage,
      alertPage,
      alertDialogPage,
      aspectRatioPage,
      attachmentPage,
      avatarPage,
      badgePage,
      breadcrumbPage,
      bubblePage,
      buttonPage,
      buttonGroupPage,
      calendarPage,
      cardPage,
      carouselPage,
      checkboxPage,
      collapsiblePage,
      comboboxPage,
      commandPage,
      contextMenuPage,
      datePickerPage,
      directionPage,
      dialogPage,
      drawerPage,
      dropdownMenuPage,
      emptyPage,
      fieldPage,
      formPage,
      hoverCardPage,
      itemPage,
      inputPage,
      inputGroupPage,
      inputOtpPage,
      kbdPage,
      labelPage,
      markerPage,
      messagePage,
      messageScrollerPage,
      menubarPage,
      nativeSelectPage,
      navigationMenuPage,
      paginationPage,
      popoverPage,
      progressPage,
      radioGroupPage,
      resizablePage,
      scrollAreaPage,
      separatorPage,
      selectPage,
      sheetPage,
      sidebarPage,
      skeletonPage,
      sliderPage,
      spinnerPage,
      sonnerPage,
      switchPage,
      tabsPage,
      tablePage,
      textareaPage,
      togglePage,
      toastPage,
      toggleGroupPage,
      tooltipPage,
      typographyPage,
    ].map((page) => [page.slug, page]),
  ),
};
