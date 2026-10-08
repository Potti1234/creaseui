import { mapDocsExamples } from '@/docs/components/pages/map/source'
export const mapPopupFixtures = [
  {
    title: 'Marker popup',
    description:
      'Open a place popup by clicking its marker and close it with the close button.',
  },
  {
    title: 'Standalone popup',
    description:
      'Anchor a popup anywhere on the map and reopen it from the application.',
  },
] as const
export const mapPopupExamples = (renderer: 'tailwind' | 'stylex') =>
  mapDocsExamples('map-popup', mapPopupFixtures, renderer)
