import { mapDocsExamples } from '@/docs/components/pages/map/source'
export const mapControlsFixtures = [
  {
    title: 'Navigation controls',
    description:
      'Zoom, reset north, or enter fullscreen with keyboard-accessible buttons.',
  },
  {
    title: 'Location and fullscreen',
    description:
      'Move controls to another corner and request your location on demand.',
  },
] as const
export const mapControlsExamples = (renderer: 'tailwind' | 'stylex') =>
  mapDocsExamples('map-controls', mapControlsFixtures, renderer)
