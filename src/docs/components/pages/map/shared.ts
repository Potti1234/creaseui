import { mapDocsExamples } from '@/docs/components/pages/map/source'
export const mapFixtures = [
  {
    title: 'Basic map',
    description:
      'Start with the OpenFreeMap Positron basemap and explore Munich.',
  },
  {
    title: 'Controlled viewport',
    description:
      'Pan and zoom, read the viewport, then reset it from the application model.',
  },
] as const
export const mapExamples = (renderer: 'tailwind' | 'stylex') =>
  mapDocsExamples('map', mapFixtures, renderer)
