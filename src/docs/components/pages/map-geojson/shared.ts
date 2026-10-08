import { mapDocsExamples } from '@/docs/components/pages/map/source'
export const mapGeojsonFixtures = [
  {
    title: 'Region overlay',
    description: 'Click the central Munich region to inspect its properties.',
  },
  {
    title: 'Blank map and outlines',
    description:
      'Use a tile-free canvas for a focused geographic visualization.',
  },
] as const
export const mapGeojsonExamples = (renderer: 'tailwind' | 'stylex') =>
  mapDocsExamples('map-geojson', mapGeojsonFixtures, renderer)
