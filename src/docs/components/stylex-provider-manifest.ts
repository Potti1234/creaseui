import { installStyleXExamplePreviewProvider } from '@/docs/components/catalog';
import { accordionStyleXPreview } from '@/docs/components/pages/accordion/stylex';
import { alertStyleXPreview } from '@/docs/components/pages/alert/stylex';
import { aspectRatioStyleXPreview } from '@/docs/components/pages/aspect-ratio/stylex';
import { avatarStyleXPreview } from '@/docs/components/pages/avatar/stylex';
import { badgeStyleXPreview } from '@/docs/components/pages/badge/stylex';
import { breadcrumbStyleXPreview } from '@/docs/components/pages/breadcrumb/stylex';
import { kbdStyleXPreview } from '@/docs/components/pages/kbd/stylex';

installStyleXExamplePreviewProvider('accordion', accordionStyleXPreview);
installStyleXExamplePreviewProvider('alert', alertStyleXPreview);
installStyleXExamplePreviewProvider('aspect-ratio', aspectRatioStyleXPreview);
installStyleXExamplePreviewProvider('avatar', avatarStyleXPreview);
installStyleXExamplePreviewProvider('badge', badgeStyleXPreview);
installStyleXExamplePreviewProvider('breadcrumb', breadcrumbStyleXPreview);
installStyleXExamplePreviewProvider('kbd', kbdStyleXPreview);
