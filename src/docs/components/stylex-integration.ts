import {
  installStyleXExamplePreviewProvider,
  installStyleXSpecimenProvider,
} from '@/docs/components/catalog'
import {
  catalogSpecimens,
} from '@/docs/components/stylex-specimens'
import { accordionStyleXPreview } from '@/docs/components/pages/accordion/stylex'

installStyleXSpecimenProvider(catalogSpecimens)
installStyleXExamplePreviewProvider('accordion', accordionStyleXPreview)
