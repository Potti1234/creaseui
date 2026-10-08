import { mapDocsExamples } from '@/docs/components/pages/map/source'
export const mapArcFixtures = [
  {
    title: 'City connection',
    description: 'Connect Munich and Paris with a sampled curve.',
  },
  {
    title: 'Reverse curvature',
    description:
      'Change curvature and color to distinguish another connection.',
  },
] as const
export const mapArcExamples = (renderer: 'tailwind' | 'stylex') =>
  mapDocsExamples('map-arc', mapArcFixtures, renderer)
