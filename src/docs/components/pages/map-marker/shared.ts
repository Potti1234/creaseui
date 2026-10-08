import { mapDocsExamples } from '@/docs/components/pages/map/source'
export const mapMarkerFixtures = [
  {
    title: 'Markers and labels',
    description:
      'Place labeled landmarks and focus or hover a marker to see its tooltip.',
  },
  {
    title: 'Draggable marker',
    description:
      'Drag the marker and store its coordinates from MapMarkerDragged.',
  },
] as const
export const mapMarkerExamples = (renderer: 'tailwind' | 'stylex') =>
  mapDocsExamples('map-marker', mapMarkerFixtures, renderer)
