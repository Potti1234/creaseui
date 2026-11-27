import { Map, MapControls, Select } from '#components'
import { mapTranslations } from '../../behaviors/map-localization'
import { defineComponentDocs } from '../types'
import { createMapDemo, mapExampleView, MapDemoMessage } from './map-shared'
import { exampleApplicationSource } from './source'

const labels: Record<string, string> = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  native: 'Local names',
}
const Demo = createMapDemo(
  'DocsMapLocalizationDemo',
  (h, model, kind, idPrefix) => {
    const selected = model.selected === 'positron' ? 'en' : model.selected
    const custom = kind === 'translations'
    const translations = mapTranslations(
      selected,
      custom
        ? {
            zoomIn:
              selected === 'de'
                ? 'Karte vergrößern'
                : selected === 'fr'
                  ? 'Agrandir la carte'
                  : 'Enlarge the map',
          }
        : {},
    )
    return Map(h, {
      key: `${idPrefix}-map`,
      ariaLabel: 'map localization example in Munich',
      center: [11.576124, 48.137154],
      zoom: 11,
      language: selected,
      translations,
      toMessage: message => message as never,
      children: [
        MapControls(h, { language: selected, translations }),
        h.div
          .class(
            'absolute top-3 left-3 z-10 flex flex-wrap items-center gap-3 rounded-lg bg-background p-2 text-sm text-foreground shadow-md',
          )
          .children(
            h.div.class('flex items-center gap-3').children(
              h.label
                .attr('for', `${idPrefix}-language-button`)
                .children('Language'),
              Select(h, {
                key: `${idPrefix}-language`,
                ariaLabel: 'Map language',
                props: {
                  open: model.selectOpen,
                  items: Object.keys(labels).map(value => ({
                    value,
                    label: labels[value]!,
                  })),
                  value: selected,
                },
                onEmit: {
                  Picked: ({ value }) =>
                    typeof value === 'string'
                      ? MapDemoMessage.PickedSelect({ value })
                      : undefined,
                  RequestedOpen: () => MapDemoMessage.RequestedOpenSelect(),
                  RequestedClose: () => MapDemoMessage.RequestedCloseSelect(),
                  Settled: () => undefined,
                },
              }) as never,
            ),
          ),
      ],
    })
  },
)
const source = exampleApplicationSource({
  imports: `import { Map, MapControls, mapTranslations } from '@/ui/effect/ui'`,
  body: `Map(h, {
  ariaLabel: 'map localization example in Munich',
  center: [11.576124, 48.137154],
  zoom: 11,
  language,
  translations: mapTranslations(language),
  toMessage: message => message,
})`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { mapTranslations } from '@/ui/effect/ui'\n\nMap(h, { language, translations, toMessage })`,
  examples: [
    { title: 'Localized map', view: mapExampleView(Demo, 'localized'), source },
    {
      title: 'Control translations',
      view: mapExampleView(Demo, 'translations'),
      source,
    },
  ],
})
