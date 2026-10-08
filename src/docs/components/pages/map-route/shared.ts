import { mapDocsExamples } from '@/docs/components/pages/map/source'
export const mapRouteFixtures = [
  {
    title: 'Route between landmarks',
    description: 'Connect Marienplatz to Odeonsplatz with a GeoJSON line.',
  },
  {
    title: 'Dashed route',
    description: 'Use a dashed line and custom color for a secondary route.',
  },
] as const
export const mapRouteExamples = (renderer: 'tailwind' | 'stylex') =>
  mapDocsExamples('map-route', mapRouteFixtures, renderer)
