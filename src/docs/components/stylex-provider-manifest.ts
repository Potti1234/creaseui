import { installStyleXExamplePreviewProvider } from '@/docs/components/catalog';
import { accordionStyleXPreview } from '@/docs/components/pages/accordion/stylex';
import { alertStyleXPreview } from '@/docs/components/pages/alert/stylex';
import { aspectRatioStyleXPreview } from '@/docs/components/pages/aspect-ratio/stylex';

installStyleXExamplePreviewProvider('accordion', accordionStyleXPreview);
installStyleXExamplePreviewProvider('alert', alertStyleXPreview);
installStyleXExamplePreviewProvider('aspect-ratio', aspectRatioStyleXPreview);
