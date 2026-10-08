import { mapDocsExamples } from '@/docs/components/pages/map/source'
export const mapClusterFixtures = [
  {
    title: 'Clustered locations',
    description:
      'Click a cluster to expand its 120 deterministic Munich locations.',
  },
  {
    title: 'Custom cluster styling',
    description:
      'Change the cluster radius and colors to suit your data density.',
  },
] as const
export const mapClusterExamples = (renderer: 'tailwind' | 'stylex') =>
  mapDocsExamples('map-cluster', mapClusterFixtures, renderer)
