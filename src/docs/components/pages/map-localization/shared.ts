import { mapDocsExamples } from '@/docs/components/pages/map/source'
export const mapLocalizationFixtures = [
  {
    title: 'Localized map',
    description:
      'Start in English and switch map labels and controls to German, French, or local names.',
  },
  {
    title: 'Control translations',
    description:
      'Provide custom translations for controls and status messages in your application.',
  },
] as const
export const mapLocalizationExamples = (renderer: 'tailwind' | 'stylex') =>
  mapDocsExamples('map-localization', mapLocalizationFixtures, renderer)
