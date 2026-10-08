import { mapDocsExamples } from '@/docs/components/pages/map/source'
export const mapStylesFixtures = [
  {
    title: 'Basemap styles',
    description:
      'Switch between Positron, Liberty, Bright, and Dark without losing map state.',
  },
  {
    title: 'Custom palette',
    description:
      'Switch between cool and warm palettes using the Crease UI semantic map colors.',
  },
] as const
export const mapStylesExamples = (renderer: 'tailwind' | 'stylex') =>
  mapDocsExamples('map-styles', mapStylesFixtures, renderer)
